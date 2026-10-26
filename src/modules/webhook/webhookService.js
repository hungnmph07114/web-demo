const { pool } = require('../../config/db');
const notificationService = require('../notification/notificationService');

class WebhookService {
  constructor() {
    this.initTable();
  }

  async initTable() {
    try {
      await pool.query(`
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100);

        CREATE TABLE IF NOT EXISTS webhook_logs (
          id SERIAL PRIMARY KEY,
          gateway VARCHAR(50),
          transaction_ref VARCHAR(100),
          order_display_id VARCHAR(50),
          amount NUMERIC(15, 2),
          content TEXT,
          raw_payload JSONB,
          status VARCHAR(50), -- 'success' | 'ignored' | 'failed' | 'partial'
          response_message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (err) {
      console.error('Error creating webhook_logs table:', err.message);
    }
  }

  /**
   * Trích xuất mã đơn hàng dạng TP-XXXX từ nội dung chuyển khoản
   */
  extractOrderCode(text) {
    if (!text) return null;
    const match = text.toUpperCase().match(/TP-?\s*([0-9]{4,6})/);
    if (match) {
      return `TP-${match[1]}`;
    }
    return null;
  }

  /**
   * Xử lý webhook chuyển khoản ngân hàng (chuẩn SePay / Casso / MBBank / Techcombank)
   */
  async processBankTransfer(payload) {
    await this.initTable();

    // Chuẩn hóa dữ liệu từ các dịch vụ khác nhau:
    // SePay: { gateway, transactionDate, transferType: "in", transferAmount, content, referenceCode, description }
    // Casso: { data: [{ amount, description, tid }] }
    // Simulator: { orderCode, amount, bankName, referenceCode, content }

    let gateway = payload.gateway || payload.bankName || 'BANK_247';
    let transferAmount = 0;
    let content = '';
    let referenceCode = payload.referenceCode || payload.tid || `TXN-${Date.now()}`;
    let transferType = payload.transferType || 'in';

    if (payload.data && Array.isArray(payload.data) && payload.data.length > 0) {
      // Dạng Casso
      const first = payload.data[0];
      transferAmount = parseFloat(first.amount) || 0;
      content = first.description || '';
      referenceCode = first.tid || referenceCode;
    } else {
      transferAmount = parseFloat(payload.transferAmount || payload.amount || 0);
      content = payload.content || payload.description || payload.transferContent || '';
    }

    // Bỏ qua nếu là giao dịch tiền ra (out)
    if (transferType === 'out' || transferAmount <= 0) {
      return {
        success: false,
        status: 'ignored',
        message: 'Bỏ qua giao dịch tiền ra (transferType != in)'
      };
    }

    // 1. Trích xuất mã đơn hàng
    let orderCode = payload.orderCode || this.extractOrderCode(content);

    if (!orderCode) {
      await this.saveLog({
        gateway,
        transaction_ref: referenceCode,
        order_display_id: null,
        amount: transferAmount,
        content,
        raw_payload: payload,
        status: 'ignored',
        response_message: 'Không tìm thấy cú pháp mã đơn hàng TP-xxxx trong nội dung CK'
      });

      return {
        success: false,
        status: 'ignored',
        message: 'Nội dung chuyển khoản không chứa mã đơn hàng hợp lệ (cần có TP-xxxx)'
      };
    }

    // 2. Tìm kiếm đơn hàng trong database
    const orderRes = await pool.query(`
      SELECT * FROM orders WHERE display_id = $1
    `, [orderCode]);

    if (orderRes.rows.length === 0) {
      await this.saveLog({
        gateway,
        transaction_ref: referenceCode,
        order_display_id: orderCode,
        amount: transferAmount,
        content,
        raw_payload: payload,
        status: 'failed',
        response_message: `Đơn hàng ${orderCode} không tồn tại trong hệ thống`
      });

      return {
        success: false,
        status: 'failed',
        message: `Không tìm thấy đơn hàng với mã ${orderCode}`
      };
    }

    const order = orderRes.rows[0];

    // 3. Nếu đơn hàng đã được thu tiền trước đó
    if (order.payment_status === 'captured') {
      await this.saveLog({
        gateway,
        transaction_ref: referenceCode,
        order_display_id: orderCode,
        amount: transferAmount,
        content,
        raw_payload: payload,
        status: 'success',
        response_message: `Đơn hàng ${orderCode} đã được thu tiền từ trước`
      });

      return {
        success: true,
        status: 'already_captured',
        message: `Đơn hàng ${orderCode} đã hoàn tất thanh toán trước đó`,
        order: {
          id: order.id,
          display_id: order.display_id,
          payment_status: order.payment_status
        }
      };
    }

    // 4. Kiểm tra số tiền nhận so với tổng tiền đơn hàng
    const orderTotal = parseFloat(order.total_amount);
    if (transferAmount < orderTotal) {
      const shortage = orderTotal - transferAmount;
      const note = `⚠️ Nhận thiếu tiền qua ${gateway}: ${transferAmount.toLocaleString('vi-VN')}đ (Thiếu: ${shortage.toLocaleString('vi-VN')}đ / Tổng: ${orderTotal.toLocaleString('vi-VN')}đ) - Mã GD: ${referenceCode}`;

      await pool.query(`
        INSERT INTO order_logs (order_id, action, note)
        VALUES ($1, 'payment.partial_received', $2);
      `, [order.id, note]);

      await this.saveLog({
        gateway,
        transaction_ref: referenceCode,
        order_display_id: orderCode,
        amount: transferAmount,
        content,
        raw_payload: payload,
        status: 'partial',
        response_message: note
      });

      return {
        success: false,
        status: 'partial',
        message: `Số tiền chuyển khoản (${transferAmount.toLocaleString('vi-VN')}đ) chưa đủ thanh toán đơn hàng (${orderTotal.toLocaleString('vi-VN')}đ)`,
        order
      };
    }

    // 5. Khớp số tiền thành công -> Chuyển trạng thái sang CAPTURED
    const updatedOrderRes = await pool.query(`
      UPDATE orders 
      SET 
        payment_status = 'captured',
        transaction_ref = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `, [referenceCode, order.id]);

    const updatedOrder = updatedOrderRes.rows[0];

    const successLog = `⚡ Cổng VietQR 24/7 tự động xác nhận nhận đủ ${transferAmount.toLocaleString('vi-VN')}đ từ ngân hàng ${gateway} (Mã GD: ${referenceCode})`;
    await pool.query(`
      INSERT INTO order_logs (order_id, action, note)
      VALUES ($1, 'payment.captured_auto_vietqr', $2);
    `, [order.id, successLog]);

    await this.saveLog({
      gateway,
      transaction_ref: referenceCode,
      order_display_id: orderCode,
      amount: transferAmount,
      content,
      raw_payload: payload,
      status: 'success',
      response_message: successLog
    });

    // Tự động gửi email xác nhận đã thanh toán VietQR thành công
    notificationService.sendPaymentSuccess(updatedOrder).catch((err) => {
      console.error('Lỗi khi gửi email thông báo thanh toán thành công:', err.message);
    });

    return {
      success: true,
      status: 'captured',
      message: `Đã tự động xác nhận thanh toán đơn hàng ${orderCode} thành công!`,
      order: updatedOrder
    };
  }

  async saveLog({ gateway, transaction_ref, order_display_id, amount, content, raw_payload, status, response_message }) {
    try {
      await pool.query(`
        INSERT INTO webhook_logs (
          gateway, transaction_ref, order_display_id, amount, content, raw_payload, status, response_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [
        gateway,
        transaction_ref,
        order_display_id,
        amount,
        content,
        JSON.stringify(raw_payload || {}),
        status,
        response_message
      ]);
    } catch (e) {
      console.error('Error saving webhook log:', e.message);
    }
  }

  async getRecentLogs(limit = 20) {
    await this.initTable();
    const res = await pool.query(`
      SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT $1;
    `, [limit]);
    return res.rows;
  }
}

module.exports = new WebhookService();

const nodemailer = require('nodemailer');
const { pool } = require('../../config/db');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.isTestAccount = false;
  }

  async getTransporter() {
    if (this.transporter) return this.transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      this.isTestAccount = false;
    } else {
      // Tự động tạo Ethereal test account nếu chưa cấu hình SMTP thật
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        this.isTestAccount = true;
      } catch (e) {
        // Fallback sang stream transport nếu mạng bị chặn
        this.transporter = nodemailer.createTransport({
          jsonTransport: true
        });
        this.isTestAccount = true;
      }
    }

    return this.transporter;
  }

  formatMoney(num) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  }

  /**
   * 1. Gửi email xác nhận đặt hàng kèm mã VietQR và chi tiết giỏ hàng
   */
  async sendOrderConfirmation(order, items = []) {
    const toEmail = order.customer_email;
    if (!toEmail) return null;

    const transporter = await this.getTransporter();
    const subject = `[TechPulse] Xác nhận đơn hàng thành công #${order.display_id}`;

    const itemsRowsHtml = items.map((it) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #334155;">
          <strong>${it.product_title}</strong><br/>
          <span style="font-size: 12px; color: #94a3b8;">${it.variant_title} | SKU: ${it.sku}</span>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #334155; text-align: center;">${it.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #334155; text-align: right; color: #38bdf8;">
          ${this.formatMoney(it.total_price)}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .brand { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 800; color: #38bdf8; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
          .sub { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
          .card { background: rgba(255,255,255,0.03); border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          .total-box { font-size: 18px; font-weight: bold; color: #38bdf8; text-align: right; margin-top: 15px; }
          .qr-box { text-align: center; background: #0f172a; padding: 20px; border-radius: 8px; border: 1px dashed #38bdf8; margin-top: 20px; }
          .btn { display: inline-block; background: #0284c7; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">⚡ TechPulse Modular E-Commerce</div>
          <div class="title">Đơn hàng #${order.display_id} đã được khởi tạo!</div>
          <div class="sub">Xin chào <strong>${order.customer_name}</strong>, cảm ơn bạn đã lựa chọn mua sắm thiết bị công nghệ tại TechPulse. Dưới đây là thông tin chi tiết đơn hàng của bạn:</div>

          <div class="card">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Địa chỉ giao hàng</div>
            <div style="font-size: 14px; font-weight: bold; color: #ffffff;">${order.customer_name} - ${order.customer_phone}</div>
            <div style="font-size: 14px; color: #cbd5e1; margin-top: 2px;">${order.shipping_address}</div>
          </div>

          <table style="margin-bottom: 20px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.05); color: #94a3b8; text-align: left;">
                <th style="padding: 8px 12px;">Sản phẩm</th>
                <th style="padding: 8px 12px; text-align: center;">SL</th>
                <th style="padding: 8px 12px; text-align: right;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div class="total-box">
            Tổng thanh toán: ${this.formatMoney(order.total_amount)}
          </div>

          ${order.payment_status !== 'captured' ? `
            <div class="qr-box">
              <div style="font-size: 15px; font-weight: bold; color: #ffffff; margin-bottom: 8px;">Quét mã VietQR 24/7 để hoàn tất thanh toán:</div>
              <div style="font-size: 13px; color: #94a3b8; margin-bottom: 12px;">Nội dung chuyển khoản chính xác: <strong style="color: #38bdf8;">${order.vietqr_content}</strong></div>
              ${order.vietqr_image ? `<img src="${order.vietqr_image}" alt="VietQR" style="max-width: 200px; border-radius: 8px;"/>` : ''}
              <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Hệ thống ngân hàng tự động khớp tiền và xác nhận sau 2 giây.</div>
            </div>
          ` : `
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 14px; text-align: center; color: #34d399; font-weight: bold; margin-top: 20px;">
              ✅ Đơn hàng đã được thanh toán hoàn tất qua Cổng VietQR.
            </div>
          `}

          <div style="text-align: center;">
            <a href="http://localhost:3000" class="btn">Tra cứu tiến độ đơn hàng trực tuyến</a>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"TechPulse Store" <no-reply@techpulse.vn>',
        to: toEmail,
        subject,
        html: htmlContent
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      await this.logEmail(order.id, toEmail, subject, 'ORDER_CONFIRMATION', previewUrl, 'sent');
      return { success: true, previewUrl };
    } catch (err) {
      console.error('Lỗi khi gửi email xác nhận đặt hàng:', err);
      await this.logEmail(order.id, toEmail, subject, 'ORDER_CONFIRMATION', null, 'failed');
      return { success: false, error: err.message };
    }
  }

  /**
   * 2. Gửi email thông báo thanh toán VietQR thành công
   */
  async sendPaymentSuccess(order) {
    const toEmail = order.customer_email;
    if (!toEmail) return null;

    const transporter = await this.getTransporter();
    const subject = `[TechPulse] Đã thanh toán thành công đơn hàng #${order.display_id}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #10b981; padding: 30px; }
          .title { font-size: 22px; font-weight: 700; color: #34d399; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">🎉 Thanh toán thành công: ${this.formatMoney(order.total_amount)}</div>
          <p style="color: #cbd5e1; line-height: 1.5;">
            Xin chào <strong>${order.customer_name}</strong>, TechPulse xin xác nhận hệ thống VietQR 24/7 đã nhận đủ số tiền thanh toán cho đơn hàng <strong>#${order.display_id}</strong>.
          </p>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <div><strong>Mã đơn hàng:</strong> ${order.display_id}</div>
            <div><strong>Số tiền thực nhận:</strong> <span style="color: #38bdf8; font-weight: bold;">${this.formatMoney(order.total_amount)}</span></div>
            <div><strong>Mã giao dịch ngân hàng:</strong> <code>${order.transaction_ref || 'FT-AUTO-VIETQR'}</code></div>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">
            Đội ngũ kho TechPulse đang tiến hành đóng gói bọc xốp chống sốc và bàn giao cho đơn vị vận chuyển sớm nhất!
          </p>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"TechPulse Store" <no-reply@techpulse.vn>',
        to: toEmail,
        subject,
        html: htmlContent
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      await this.logEmail(order.id, toEmail, subject, 'PAYMENT_SUCCESS', previewUrl, 'sent');
      return { success: true, previewUrl };
    } catch (err) {
      console.error('Lỗi gửi email thanh toán thành công:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 3. Gửi email thông báo kiện hàng bắt đầu được bưu tá đi giao
   */
  async sendShippingNotification(order, shipment = {}) {
    const toEmail = order.customer_email;
    if (!toEmail) return null;

    const transporter = await this.getTransporter();
    const subject = `[TechPulse] Đơn hàng #${order.display_id} đang trên đường giao đến bạn`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #38bdf8; padding: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 style="color: #38bdf8; margin-top: 0;">🚚 Kiện hàng của bạn đang được giao!</h2>
          <p style="color: #cbd5e1;">Xin chào <strong>${order.customer_name}</strong>, đơn hàng công nghệ <strong>#${order.display_id}</strong> đã rời kho và đang trên đường chuyển phát tới bạn.</p>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <div><strong>Hãng vận chuyển:</strong> ${shipment.carrierName || 'Giao Hàng Nhanh (GHN)'}</div>
            <div><strong>Mã vận đơn:</strong> <code style="color: #38bdf8;">${shipment.trackingCode || order.tracking_code}</code></div>
            <div><strong>Bưu tá phụ trách:</strong> ${shipment.driverName || order.driver_name || 'Nguyễn Văn Hùng'}</div>
            <div><strong>SĐT Bưu tá:</strong> <a href="tel:${shipment.driverPhone || order.driver_phone || '0988.234.567'}" style="color: #34d399; font-weight: bold;">${shipment.driverPhone || order.driver_phone || '0988.234.567'}</a></div>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">Quý khách vui lòng để ý điện thoại để nhận kiện hàng đúng hẹn.</p>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"TechPulse Store" <no-reply@techpulse.vn>',
        to: toEmail,
        subject,
        html: htmlContent
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      await this.logEmail(order.id, toEmail, subject, 'SHIPPING_OUT', previewUrl, 'sent');
      return { success: true, previewUrl };
    } catch (err) {
      console.error('Lỗi gửi email giao hàng:', err);
      return { success: false, error: err.message };
    }
  }

  async logEmail(orderId, toEmail, subject, templateType, previewUrl, status) {
    try {
      let validOrderId = null;
      if (orderId) {
        const { rows } = await pool.query('SELECT id FROM orders WHERE id = $1', [orderId]);
        if (rows.length > 0) validOrderId = orderId;
      }

      await pool.query(`
        INSERT INTO email_logs (order_id, to_email, subject, template_type, preview_url, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [validOrderId, toEmail, subject, templateType, previewUrl, status]);
    } catch (e) {
      console.error('Lỗi khi ghi log email:', e);
    }
  }

  async getLogs(limit = 20) {
    const { rows } = await pool.query(`
      SELECT * FROM email_logs
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);
    return rows;
  }
}

module.exports = new NotificationService();

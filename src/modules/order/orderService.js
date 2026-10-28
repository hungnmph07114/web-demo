const crypto = require('crypto');
const { pool } = require('../../config/db');
const notificationService = require('../notification/notificationService');

class OrderService {
  /**
   * Tạo đơn hàng mới theo tư duy Medusa (ACID Transaction + Khởi tạo lộ trình giao vận)
   */
  async createOrder({
    userId,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    note,
    items = [],
    promotion_code,
    payment_method = 'vietqr'
  }) {
    if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
      throw { status: 400, message: 'Vui lòng điền đầy đủ họ tên, email, số điện thoại và địa chỉ nhận hàng' };
    }

    if (!items || items.length === 0) {
      throw { status: 400, message: 'Giỏ hàng của bạn đang trống' };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Kiểm tra tồn kho & tính toán giá từng variant
      let subtotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        const vRes = await client.query(`
          SELECT 
            v.*,
            p.title as product_title,
            p.thumbnail as product_thumbnail
          FROM product_variants v
          JOIN products p ON v.product_id = p.id
          WHERE v.id = $1 AND v.is_active = true
          FOR UPDATE
        `, [item.variantId]);

        if (vRes.rows.length === 0) {
          throw { status: 400, message: `Biến thể sản phẩm #${item.variantId} không tồn tại hoặc đã ngừng bán` };
        }

        const variant = vRes.rows[0];
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

        if (variant.inventory_quantity < qty) {
          throw {
            status: 400,
            message: `Sản phẩm "${variant.product_title} (${variant.title})" chỉ còn ${variant.inventory_quantity} sản phẩm trong kho (bạn đặt ${qty})`
          };
        }

        const itemTotal = parseFloat(variant.price) * qty;
        subtotal += itemTotal;

        verifiedItems.push({
          variant_id: variant.id,
          product_title: variant.product_title,
          variant_title: variant.title,
          sku: variant.sku,
          unit_price: parseFloat(variant.price),
          quantity: qty,
          total_price: itemTotal,
          thumbnail: variant.thumbnail || variant.product_thumbnail
        });

        // Giảm tồn kho trực tiếp
        await client.query(`
          UPDATE product_variants 
          SET inventory_quantity = inventory_quantity - $1 
          WHERE id = $2;
        `, [qty, variant.id]);
      }

      // 2. Tính toán mã giảm giá (nếu có)
      let discountTotal = 0;
      let appliedPromoCode = null;

      if (promotion_code && promotion_code.trim()) {
        const cleanCode = promotion_code.trim().toUpperCase();
        const promoRes = await client.query(`
          SELECT * FROM promotions 
          WHERE UPPER(code) = $1 AND is_active = true 
          FOR UPDATE
        `, [cleanCode]);

        if (promoRes.rows.length > 0) {
          const promo = promoRes.rows[0];
          if (promo.usage_limit <= 0 || promo.usage_count < promo.usage_limit) {
            if (subtotal >= parseFloat(promo.min_order_value)) {
              if (promo.type === 'percentage') {
                discountTotal = (subtotal * parseFloat(promo.value)) / 100;
                if (parseFloat(promo.max_discount) > 0 && discountTotal > parseFloat(promo.max_discount)) {
                  discountTotal = parseFloat(promo.max_discount);
                }
              } else {
                discountTotal = parseFloat(promo.value);
              }
              discountTotal = Math.min(discountTotal, subtotal);
              appliedPromoCode = promo.code;

              // Tăng số lượt đã sử dụng
              await client.query('UPDATE promotions SET usage_count = usage_count + 1 WHERE id = $1', [promo.id]);
            }
          }
        }
      }

      // 2.5. Đọc cấu hình Phí vận chuyển & Tài khoản ngân hàng VietQR từ store_settings
      const settingsRes = await client.query('SELECT * FROM store_settings WHERE id = 1 LIMIT 1');
      const storeConfig = settingsRes.rows[0] || {};
      const freeThreshold =
        storeConfig.free_shipping_threshold !== undefined && storeConfig.free_shipping_threshold !== null
          ? parseFloat(storeConfig.free_shipping_threshold)
          : 1000000;
      const baseShipFee =
        storeConfig.base_shipping_fee !== undefined && storeConfig.base_shipping_fee !== null
          ? parseFloat(storeConfig.base_shipping_fee)
          : 30000;

      const shippingFee = subtotal >= freeThreshold ? 0 : baseShipFee;
      const totalAmount = Math.max(0, subtotal - discountTotal + shippingFee);

      // 3. Tạo mã hiển thị Display ID (VD: TP-1025)
      const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      const displayId = `TP-${Date.now().toString().slice(-4)}${randomHex}`;
      const trackingCode = `GHN-${displayId.replace('TP-', '')}${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Tạo mã VietQR động NAPAS 247 theo cấu hình ngân hàng của cửa hàng
      const bankId = (storeConfig.bank_id || process.env.VIETQR_BANK_ID || 'MB').trim();
      const accountNo = (storeConfig.bank_account_no || process.env.VIETQR_ACCOUNT_NO || '0345678910').trim();
      const accountName = (storeConfig.bank_account_name || process.env.VIETQR_ACCOUNT_NAME || 'ATELIER RETAIL CORP').trim();
      const vietqrContent = `${displayId} ${customer_phone.replace(/\s+/g, '')}`;
      const encodedAccountName = encodeURIComponent(accountName);
      const encodedInfo = encodeURIComponent(vietqrContent);
      const vietqrImage = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${encodedInfo}&accountName=${encodedAccountName}`;

      const paymentStatus = payment_method === 'cod' ? 'awaiting_cod' : 'awaiting_vietqr';

      // 5. Lưu Order kèm thông tin giao vận mặc định
      const orderRes = await client.query(`
        INSERT INTO orders (
          display_id, user_id, customer_name, customer_email, customer_phone, shipping_address, note,
          subtotal, discount_total, shipping_fee, total_amount, payment_method,
          payment_status, fulfillment_status, promotion_code, vietqr_content, vietqr_image,
          shipping_carrier, tracking_code, driver_name, driver_phone, estimated_delivery_date
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'processing', $14, $15, $16,
          'GHN', $17, 'Nguyễn Văn Hùng (Bưu tá GHN)', '0988.234.567', CURRENT_TIMESTAMP + INTERVAL '2 days'
        ) RETURNING *;
      `, [
        displayId,
        userId || null,
        customer_name.trim(),
        customer_email.trim(),
        customer_phone.trim(),
        shipping_address.trim(),
        note || null,
        subtotal,
        discountTotal,
        shippingFee,
        totalAmount,
        payment_method,
        paymentStatus,
        appliedPromoCode,
        vietqrContent,
        vietqrImage,
        trackingCode
      ]);

      const order = orderRes.rows[0];

      // 6. Lưu Order Items
      for (const item of verifiedItems) {
        await client.query(`
          INSERT INTO order_items (
            order_id, variant_id, product_title, variant_title, sku, unit_price, quantity, total_price, thumbnail
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [
          order.id,
          item.variant_id,
          item.product_title,
          item.variant_title,
          item.sku,
          item.unit_price,
          item.quantity,
          item.total_price,
          item.thumbnail
        ]);
      }

      // 7. Ghi nhận nhật ký trạng thái (Order Logs) & Sự kiện giao vận đầu tiên
      await client.query(`
        INSERT INTO order_logs (order_id, action, note)
        VALUES ($1, 'order.placed', 'Đơn hàng vừa được khởi tạo thành công');
      `, [order.id]);

      await client.query(`
        INSERT INTO shipment_tracking_events (order_id, status, hub_name, description, created_at)
        VALUES ($1, 'order_received', 'Hệ thống Điều phối Kho TechPulse', 'Đơn hàng đã được tiếp nhận và đang chờ đóng gói xuất kho.', CURRENT_TIMESTAMP);
      `, [order.id]);

      await client.query('COMMIT');

      order.items = verifiedItems;

      // Gửi email xác nhận đơn hàng tự động (bất đồng bộ)
      notificationService.sendOrderConfirmation(order, verifiedItems).catch((err) => {
        console.error('Lỗi khi gửi email xác nhận đặt hàng:', err.message);
      });

      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Hoàn trả tồn kho biến thể & lượt sử dụng voucher khi đơn hàng bị hủy hoặc hoàn tiền
   */
  async restoreInventoryAndPromoIfNeeded(client, order, reasonNote) {
    const itemsRes = await client.query(
      'SELECT variant_id, quantity FROM order_items WHERE order_id = $1',
      [order.id]
    );

    for (const item of itemsRes.rows) {
      if (item.variant_id && item.quantity > 0) {
        await client.query(
          'UPDATE product_variants SET inventory_quantity = inventory_quantity + $1 WHERE id = $2',
          [item.quantity, item.variant_id]
        );
      }
    }

    if (order.promotion_code) {
      await client.query(
        'UPDATE promotions SET usage_count = GREATEST(0, usage_count - 1) WHERE UPPER(code) = UPPER($1)',
        [order.promotion_code]
      );
    }

    await client.query(
      'INSERT INTO order_logs (order_id, action, note) VALUES ($1, $2, $3)',
      [order.id, 'inventory.restored', reasonNote || 'Đã hoàn trả số lượng tồn kho biến thể và lượt sử dụng voucher']
    );
  }

  async listOrders({ payment_status, fulfillment_status, search } = {}) {
    let query = `
      SELECT 
        o.*,
        COUNT(oi.id) as total_items,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi.id,
            'product_title', oi.product_title,
            'variant_title', oi.variant_title,
            'sku', oi.sku,
            'unit_price', oi.unit_price,
            'quantity', oi.quantity,
            'total_price', oi.total_price,
            'thumbnail', oi.thumbnail
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];

    if (payment_status && payment_status !== 'all') {
      params.push(payment_status);
      query += ` AND o.payment_status = $${params.length}`;
    }

    if (fulfillment_status && fulfillment_status !== 'all') {
      params.push(fulfillment_status);
      query += ` AND o.fulfillment_status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (
        LOWER(o.display_id) LIKE $${params.length} 
        OR LOWER(o.customer_name) LIKE $${params.length} 
        OR LOWER(o.customer_phone) LIKE $${params.length}
      )`;
    }

    query += `
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    if (limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (pageNum - 1) * pageSize;
      params.push(pageSize, offset);
      query += ` LIMIT ${params.length - 1} OFFSET ${params.length}`;
    }

    const res = await pool.query(query, params);
    return res.rows;
  }

  async getMyOrders(userId, email) {
    const res = await pool.query(`
      SELECT 
        o.*,
        COUNT(oi.id) as total_items,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi.id,
            'product_title', oi.product_title,
            'variant_title', oi.variant_title,
            'sku', oi.sku,
            'unit_price', oi.unit_price,
            'quantity', oi.quantity,
            'total_price', oi.total_price,
            'thumbnail', oi.thumbnail
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE (o.user_id IS NOT NULL AND o.user_id = $1) 
         OR (o.customer_email IS NOT NULL AND LOWER(o.customer_email) = LOWER($2))
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    `, [userId || 0, email || '']);
    return res.rows;
  }

  async getOrderDetails(idOrDisplayId, requestingUser = null) {
    const cleanInput = String(idOrDisplayId || '').trim().replace(/^#/, '');
    const isNum = /^\d+$/.test(cleanInput);

    // Bảo vệ chống dò quét ID tuần tự (IDOR): Khách vãng lai chỉ được tra cứu theo mã display_id (VD: TP-8801)
    if (isNum && (!requestingUser || (requestingUser.role !== 'admin' && !requestingUser.id))) {
      throw {
        status: 403,
        message: 'Vui lòng tra cứu bằng mã đơn hàng chuẩn (ví dụ: TP-8801)'
      };
    }

    const orderRes = await pool.query(`
      SELECT * FROM orders 
      WHERE ${isNum ? 'id = $1' : 'UPPER(display_id) = UPPER($1)'}
    `, [isNum ? parseInt(cleanInput, 10) : cleanInput]);

    if (orderRes.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy thông tin đơn hàng' };
    }

    const order = orderRes.rows[0];

    // Nếu truy vấn bằng ID số nhưng không phải Admin và không phải chủ đơn hàng
    if (
      isNum &&
      requestingUser &&
      requestingUser.role !== 'admin' &&
      order.user_id !== requestingUser.id &&
      (!order.customer_email || order.customer_email.toLowerCase() !== (requestingUser.email || '').toLowerCase())
    ) {
      throw { status: 403, message: 'Bạn không có quyền truy cập đơn hàng này' };
    }

    const itemsRes = await pool.query(`
      SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC
    `, [order.id]);

    const logsRes = await pool.query(`
      SELECT * FROM order_logs WHERE order_id = $1 ORDER BY created_at ASC
    `, [order.id]);

    order.items = itemsRes.rows;
    order.logs = logsRes.rows;

    // Bảo vệ PII: Nếu không phải Admin và không phải chính chủ đơn hàng
    const isOwner = requestingUser && (
      requestingUser.role === 'admin' ||
      (order.user_id && order.user_id === requestingUser.id) ||
      (order.customer_email && requestingUser.email && order.customer_email.toLowerCase() === (requestingUser.email || '').toLowerCase())
    );

    if (!isOwner) {
      if (order.customer_phone) {
        order.customer_phone = order.customer_phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
      }
      if (order.customer_email) {
        order.customer_email = order.customer_email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      }
      order.shipping_address = 'Địa chỉ giao hàng bảo mật (Chỉ hiển thị cho người nhận)';
    }

    return order;
  }

  async updatePaymentStatus(orderId, payment_status, note = '') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const currentRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
      if (currentRes.rows.length === 0) {
        throw { status: 404, message: 'Không tìm thấy đơn hàng' };
      }
      const currentOrder = currentRes.rows[0];

      const res = await client.query(`
        UPDATE orders 
        SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *;
      `, [payment_status, orderId]);

      await client.query(`
        INSERT INTO order_logs (order_id, action, note)
        VALUES ($1, $2, $3);
      `, [orderId, `payment.${payment_status}`, note || `Quản trị viên chuyển trạng thái thanh toán sang: ${payment_status}`]);

      // Nếu hoàn tiền (refunded) mà đơn chưa bị hủy trước đó -> hoàn kho
      if (
        payment_status === 'refunded' &&
        currentOrder.payment_status !== 'refunded' &&
        currentOrder.fulfillment_status !== 'canceled'
      ) {
        await this.restoreInventoryAndPromoIfNeeded(
          client,
          currentOrder,
          'Hoàn trả tồn kho tự động do đơn hàng chuyển sang trạng thái Hoàn tiền (Refunded)'
        );
      }

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateFulfillmentStatus(orderId, fulfillment_status, note = '') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const currentRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
      if (currentRes.rows.length === 0) {
        throw { status: 404, message: 'Không tìm thấy đơn hàng' };
      }
      const currentOrder = currentRes.rows[0];

      const res = await client.query(`
        UPDATE orders 
        SET fulfillment_status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *;
      `, [fulfillment_status, orderId]);

      await client.query(`
        INSERT INTO order_logs (order_id, action, note)
        VALUES ($1, $2, $3);
      `, [orderId, `fulfillment.${fulfillment_status}`, note || `Quản trị viên chuyển trạng thái vận chuyển sang: ${fulfillment_status}`]);

      // Nếu hủy đơn (canceled) và trước đó chưa hủy / chưa hoàn tiền -> hoàn trả tồn kho & lượt dùng voucher
      if (
        fulfillment_status === 'canceled' &&
        currentOrder.fulfillment_status !== 'canceled' &&
        currentOrder.payment_status !== 'refunded'
      ) {
        await this.restoreInventoryAndPromoIfNeeded(
          client,
          currentOrder,
          'Hoàn trả tồn kho biến thể và lượt dùng mã giảm giá do hủy đơn hàng'
        );
      }

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Khách hàng tự hủy đơn hàng khi đơn đang ở trạng thái chờ xử lý (processing) và chưa thanh toán
   */
  async cancelMyOrder(orderId, user, reason = '') {
    if (!user) {
      throw { status: 401, message: 'Vui lòng đăng nhập để thực hiện thao tác này' };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const currentRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
      if (currentRes.rows.length === 0) {
        throw { status: 404, message: 'Không tìm thấy đơn hàng' };
      }
      const order = currentRes.rows[0];

      const isOwner =
        user.role === 'admin' ||
        (order.user_id && order.user_id === user.id) ||
        (order.customer_email && user.email && order.customer_email.toLowerCase() === user.email.toLowerCase());

      if (!isOwner) {
        throw { status: 403, message: 'Bạn không có quyền hủy đơn hàng này' };
      }

      if (order.fulfillment_status !== 'processing') {
        throw {
          status: 400,
          message: 'Chỉ có thể hủy đơn hàng khi đang ở trạng thái "Chờ xử lý" (chưa đóng gói/giao hàng)'
        };
      }

      if (order.payment_status === 'captured' && user.role !== 'admin') {
        throw {
          status: 400,
          message: 'Đơn hàng đã thanh toán thành công, vui lòng liên hệ Quản trị viên để được hỗ trợ hoàn tiền'
        };
      }

      const res = await client.query(`
        UPDATE orders
        SET fulfillment_status = 'canceled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
      `, [order.id]);

      const logNote = reason
        ? `Khách hàng yêu cầu hủy đơn: ${reason}`
        : 'Khách hàng chủ động hủy đơn hàng khi đang chờ xử lý';

      await client.query(`
        INSERT INTO order_logs (order_id, action, note)
        VALUES ($1, 'order.canceled_by_customer', $2);
      `, [order.id, logNote]);

      await this.restoreInventoryAndPromoIfNeeded(
        client,
        order,
        'Hoàn trả tồn kho biến thể và lượt dùng mã giảm giá do khách hàng hủy đơn'
      );

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Tự động thu hồi các đơn hàng chờ quét VietQR quá hạn (mặc định 30 phút) và hoàn trả tồn kho
   */
  async expireStaleVietQROrders(timeoutMinutes = 30) {
    const mins = Math.max(1, parseInt(timeoutMinutes, 10) || 30);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const staleRes = await client.query(`
        SELECT * FROM orders
        WHERE payment_status = 'awaiting_vietqr'
          AND fulfillment_status = 'processing'
          AND created_at < CURRENT_TIMESTAMP - ($1 || ' minutes')::interval
        FOR UPDATE;
      `, [String(mins)]);

      const expiredOrders = [];
      for (const order of staleRes.rows) {
        await client.query(`
          UPDATE orders
          SET fulfillment_status = 'canceled', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1;
        `, [order.id]);

        await client.query(`
          INSERT INTO order_logs (order_id, action, note)
          VALUES ($1, 'order.auto_expired_vietqr', $2);
        `, [order.id, `Tự động hủy đơn và giải phóng tồn kho do quá thời hạn thanh toán VietQR (${mins} phút)`]);

        await this.restoreInventoryAndPromoIfNeeded(
          client,
          order,
          `Giải phóng tồn kho tự động sau ${mins} phút chờ quét VietQR`
        );

        expiredOrders.push(order.display_id);
      }

      await client.query('COMMIT');
      return {
        expiredCount: expiredOrders.length,
        expiredDisplayIds: expiredOrders
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new OrderService();

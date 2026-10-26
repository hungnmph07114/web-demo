const { pool } = require('../../config/db');

class OrderService {
  /**
   * Tạo đơn hàng mới theo tư duy Medusa
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
        const qty = parseInt(item.quantity) || 1;

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

      const shippingFee = subtotal >= 5000000 ? 0 : 30000; // Freeship từ 5 triệu
      const totalAmount = Math.max(0, subtotal - discountTotal + shippingFee);

      // 3. Tạo mã hiển thị Display ID (VD: TP-1025)
      const displayId = `TP-${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Tạo mã VietQR động NAPAS 247
      const bankId = process.env.VIETQR_BANK_ID || 'MB';
      const accountNo = process.env.VIETQR_ACCOUNT_NO || '0987654321';
      const accountName = process.env.VIETQR_ACCOUNT_NAME || 'NGUYEN MANH HUNG';
      const vietqrContent = `${displayId} ${customer_phone.replace(/\s+/g, '')}`;
      const encodedAccountName = encodeURIComponent(accountName);
      const encodedInfo = encodeURIComponent(vietqrContent);
      const vietqrImage = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${encodedInfo}&accountName=${encodedAccountName}`;

      const paymentStatus = payment_method === 'cod' ? 'awaiting_cod' : 'awaiting_vietqr';

      // 5. Lưu Order
      const orderRes = await client.query(`
        INSERT INTO orders (
          display_id, user_id, customer_name, customer_email, customer_phone, shipping_address, note,
          subtotal, discount_total, shipping_fee, total_amount, payment_method,
          payment_status, fulfillment_status, promotion_code, vietqr_content, vietqr_image
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'processing', $14, $15, $16
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
        vietqrImage
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

      // 7. Ghi nhận nhật ký trạng thái (Order Logs)
      await client.query(`
        INSERT INTO order_logs (order_id, action, note)
        VALUES ($1, 'order.placed', 'Đơn hàng vừa được khởi tạo thành công');
      `, [order.id]);

      await client.query('COMMIT');

      order.items = verifiedItems;
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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

  async getOrderDetails(idOrDisplayId) {
    const isNum = !isNaN(idOrDisplayId);
    const orderRes = await pool.query(`
      SELECT * FROM orders 
      WHERE ${isNum ? 'id = $1' : 'display_id = $1'}
    `, [idOrDisplayId]);

    if (orderRes.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy thông tin đơn hàng' };
    }

    const order = orderRes.rows[0];

    const itemsRes = await pool.query(`
      SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC
    `, [order.id]);

    const logsRes = await pool.query(`
      SELECT * FROM order_logs WHERE order_id = $1 ORDER BY created_at ASC
    `, [order.id]);

    order.items = itemsRes.rows;
    order.logs = logsRes.rows;

    return order;
  }

  async updatePaymentStatus(orderId, payment_status, note = '') {
    const res = await pool.query(`
      UPDATE orders 
      SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *;
    `, [payment_status, orderId]);

    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy đơn hàng' };
    }

    await pool.query(`
      INSERT INTO order_logs (order_id, action, note)
      VALUES ($1, $2, $3);
    `, [orderId, `payment.${payment_status}`, note || `Quản trị viên chuyển trạng thái thanh toán sang: ${payment_status}`]);

    return res.rows[0];
  }

  async updateFulfillmentStatus(orderId, fulfillment_status, note = '') {
    const res = await pool.query(`
      UPDATE orders 
      SET fulfillment_status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *;
    `, [fulfillment_status, orderId]);

    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy đơn hàng' };
    }

    await pool.query(`
      INSERT INTO order_logs (order_id, action, note)
      VALUES ($1, $2, $3);
    `, [orderId, `fulfillment.${fulfillment_status}`, note || `Quản trị viên chuyển trạng thái vận chuyển sang: ${fulfillment_status}`]);

    return res.rows[0];
  }
}

module.exports = new OrderService();

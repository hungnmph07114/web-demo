const { pool } = require('../../config/db');

class PromotionService {
  async listPromotions() {
    const res = await pool.query('SELECT * FROM promotions ORDER BY id DESC');
    return res.rows;
  }

  async validateCoupon(code, subtotal) {
    if (!code || !code.trim()) {
      throw { status: 400, message: 'Vui lòng cung cấp mã giảm giá' };
    }

    const cleanCode = code.trim().toUpperCase();
    const res = await pool.query(`
      SELECT * FROM promotions 
      WHERE UPPER(code) = $1 AND is_active = true
    `, [cleanCode]);

    if (res.rows.length === 0) {
      throw { status: 404, message: `Mã giảm giá "${cleanCode}" không tồn tại hoặc đã hết hiệu lực` };
    }

    const promo = res.rows[0];

    if (promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit) {
      throw { status: 400, message: `Mã giảm giá "${cleanCode}" đã đạt giới hạn lượt sử dụng` };
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    if (orderSubtotal < parseFloat(promo.min_order_value)) {
      const minFormatted = new Intl.NumberFormat('vi-VN').format(promo.min_order_value);
      throw { 
        status: 400, 
        message: `Mã "${cleanCode}" chỉ áp dụng cho đơn hàng từ ${minFormatted}đ trở lên` 
      };
    }

    let discountAmount = 0;
    if (promo.type === 'percentage') {
      discountAmount = (orderSubtotal * parseFloat(promo.value)) / 100;
      if (parseFloat(promo.max_discount) > 0 && discountAmount > parseFloat(promo.max_discount)) {
        discountAmount = parseFloat(promo.max_discount);
      }
    } else {
      // Fixed discount
      discountAmount = parseFloat(promo.value);
      if (discountAmount > orderSubtotal) {
        discountAmount = orderSubtotal;
      }
    }

    return {
      id: promo.id,
      code: promo.code,
      description: promo.description,
      type: promo.type,
      value: parseFloat(promo.value),
      discountAmount: Math.round(discountAmount)
    };
  }

  async createPromotion({ code, description, type, value, min_order_value, max_discount, usage_limit }) {
    if (!code || !value) {
      throw { status: 400, message: 'Mã giảm giá và giá trị ưu đãi là bắt buộc' };
    }

    const res = await pool.query(`
      INSERT INTO promotions (code, description, type, value, min_order_value, max_discount, usage_limit)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [
      code.trim().toUpperCase(),
      description || '',
      type || 'percentage',
      parseFloat(value),
      parseFloat(min_order_value) || 0,
      parseFloat(max_discount) || 0,
      parseInt(usage_limit) || 100
    ]);

    return res.rows[0];
  }

  async togglePromotion(id) {
    const res = await pool.query(`
      UPDATE promotions 
      SET is_active = NOT is_active 
      WHERE id = $1 
      RETURNING *;
    `, [id]);

    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy mã khuyến mãi' };
    }
    return res.rows[0];
  }
}

module.exports = new PromotionService();

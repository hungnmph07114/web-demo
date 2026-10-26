const { pool } = require('../../config/db');

class WishlistService {
  /**
   * Lấy danh sách sản phẩm yêu thích của người dùng
   */
  async getWishlist(userId) {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(`
        SELECT 
          p.id,
          p.title,
          p.subtitle,
          p.slug,
          p.thumbnail,
          c.name as category_name,
          c.icon as category_icon,
          COALESCE(MIN(v.price), 0) as min_price,
          COALESCE(MAX(v.price), 0) as max_price,
          COALESCE(SUM(v.inventory_quantity), 0) as total_inventory,
          COUNT(DISTINCT v.id) as variants_count,
          COALESCE(ROUND(AVG(r.rating), 1), 5.0) as average_rating,
          COUNT(DISTINCT r.id) as reviews_count,
          w.created_at as wishlisted_at
        FROM wishlists w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_variants v ON p.id = v.product_id AND v.is_active = true
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE w.user_id = $1 AND p.is_published = true
        GROUP BY w.id, p.id, c.id
        ORDER BY w.created_at DESC
      `, [userId]);

      const productIds = rows.map((r) => r.id);
      return {
        total: rows.length,
        productIds,
        items: rows
      };
    } finally {
      client.release();
    }
  }

  /**
   * Thêm hoặc bỏ thích (toggle) sản phẩm
   */
  async toggleWishlist(userId, productId) {
    if (!productId) throw new Error('Mã sản phẩm không hợp lệ');

    const client = await pool.connect();
    try {
      // Kiểm tra sản phẩm có trong wishlist chưa
      const { rows: existing } = await client.query(
        'SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );

      let isWishlisted = false;
      if (existing.length > 0) {
        // Đã có -> Xóa khỏi wishlist
        await client.query(
          'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2',
          [userId, productId]
        );
        isWishlisted = false;
      } else {
        // Chưa có -> Thêm vào wishlist
        await client.query(
          'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)',
          [userId, productId]
        );
        isWishlisted = true;
      }

      // Lấy danh sách ID sau khi toggle
      const { rows: allIds } = await client.query(
        'SELECT product_id FROM wishlists WHERE user_id = $1',
        [userId]
      );

      const productIds = allIds.map((r) => r.product_id);

      return {
        isWishlisted,
        productId: Number(productId),
        total: productIds.length,
        productIds
      };
    } finally {
      client.release();
    }
  }

  /**
   * Đồng bộ danh sách yêu thích từ LocalStorage khi đăng nhập
   */
  async syncWishlist(userId, productIds = []) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return this.getWishlist(userId);
    }

    const client = await pool.connect();
    try {
      for (const pid of productIds) {
        if (pid) {
          await client.query(`
            INSERT INTO wishlists (user_id, product_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, product_id) DO NOTHING
          `, [userId, pid]);
        }
      }
      return this.getWishlist(userId);
    } finally {
      client.release();
    }
  }
}

module.exports = new WishlistService();

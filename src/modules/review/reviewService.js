const { pool } = require('../../config/db');

class ReviewService {
  /**
   * Lấy danh sách đánh giá của sản phẩm kèm thống kê số sao trung bình & phân bổ
   */
  async getProductReviews(productId) {
    const client = await pool.connect();
    try {
      const { rows: reviews } = await client.query(`
        SELECT 
          r.id,
          r.product_id,
          r.user_id,
          r.user_name,
          r.rating,
          r.title,
          r.comment,
          r.verified_purchase,
          r.created_at
        FROM reviews r
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
      `, [productId]);

      // Thống kê phân bổ sao
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sumRating = 0;

      reviews.forEach((r) => {
        sumRating += r.rating;
        if (distribution[r.rating] !== undefined) {
          distribution[r.rating]++;
        }
      });

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 5.0;

      return {
        productId: Number(productId),
        averageRating,
        totalReviews,
        distribution,
        reviews
      };
    } finally {
      client.release();
    }
  }

  /**
   * Gửi đánh giá mới cho sản phẩm
   */
  async createReview({ productId, userId = null, userName, rating, title, comment, userEmail = null }) {
    if (!productId) throw new Error('Mã sản phẩm không hợp lệ');
    if (!userName || !userName.trim()) throw new Error('Vui lòng nhập tên người đánh giá');
    if (!rating || rating < 1 || rating > 5) throw new Error('Số sao đánh giá phải từ 1 đến 5');
    if (!comment || !comment.trim()) throw new Error('Vui lòng nhập nội dung nhận xét');

    const client = await pool.connect();
    try {
      // 1. Kiểm tra sản phẩm tồn tại
      const { rows: prods } = await client.query('SELECT id, title FROM products WHERE id = $1', [productId]);
      if (prods.length === 0) {
        throw new Error('Sản phẩm không tồn tại trên hệ thống');
      }

      // 2. Xác thực đã mua hàng (Verified Purchase)
      let verifiedPurchase = false;
      if (userId || userEmail) {
        const { rows: purchases } = await client.query(`
          SELECT oi.id
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          JOIN product_variants pv ON oi.variant_id = pv.id
          WHERE pv.product_id = $1
            AND (o.user_id = $2 OR LOWER(o.customer_email) = LOWER($3))
            AND (o.payment_status = 'captured' OR o.fulfillment_status = 'delivered')
          LIMIT 1
        `, [productId, userId || -1, userEmail || '']);

        if (purchases.length > 0) {
          verifiedPurchase = true;
        }
      }

      // 3. Chèn đánh giá
      const { rows: inserted } = await client.query(`
        INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [productId, userId, userName.trim(), rating, title ? title.trim() : '', comment.trim(), verifiedPurchase]);

      return inserted[0];
    } finally {
      client.release();
    }
  }

  /**
   * Xóa đánh giá (chỉ dành cho Admin hoặc chính người viết)
   */
  async deleteReview(reviewId, user) {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
      if (rows.length === 0) {
        throw new Error('Không tìm thấy đánh giá cần xóa');
      }

      const review = rows[0];
      const isAdmin = user && user.role === 'admin';
      const isOwner = user && user.id && review.user_id === user.id;

      if (!isAdmin && !isOwner) {
        throw new Error('Bạn không có quyền xóa đánh giá này');
      }

      await client.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
      return { success: true, message: 'Đã xóa đánh giá thành công' };
    } finally {
      client.release();
    }
  }
}

module.exports = new ReviewService();

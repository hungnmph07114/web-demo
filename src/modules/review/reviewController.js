const reviewService = require('./reviewService');

class ReviewController {
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const data = await reviewService.getProductReviews(productId);
      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async createReview(req, res) {
    try {
      const { productId } = req.params;
      const { rating, title, comment, userName } = req.body;

      // Hỗ trợ cả trường hợp khách đã đăng nhập lẫn khách vãng lai
      const userId = req.user ? req.user.id : null;
      const userEmail = req.user ? req.user.email : (req.body.userEmail || null);
      const authorName = userName || (req.user ? req.user.fullName : 'Khách hàng TechPulse');

      const review = await reviewService.createReview({
        productId,
        userId,
        userName: authorName,
        rating: Number(rating),
        title,
        comment,
        userEmail
      });

      return res.status(201).json({
        success: true,
        message: 'Đánh giá của bạn đã được gửi thành công!',
        data: review
      });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const result = await reviewService.deleteReview(id, req.user);
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ReviewController();

const wishlistService = require('./wishlistService');

class WishlistController {
  async getWishlist(req, res) {
    try {
      const userId = req.user.id;
      const data = await wishlistService.getWishlist(userId);
      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async toggleWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      const result = await wishlistService.toggleWishlist(userId, productId);
      return res.json({
        success: true,
        message: result.isWishlisted ? 'Đã thêm vào danh sách yêu thích ❤️' : 'Đã bỏ khỏi danh sách yêu thích',
        data: result
      });
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async syncWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productIds } = req.body;
      const data = await wishlistService.syncWishlist(userId, productIds);
      return res.json({
        success: true,
        message: 'Đã đồng bộ danh sách yêu thích thành công',
        data
      });
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new WishlistController();

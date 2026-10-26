const promotionService = require('./promotionService');

class PromotionController {
  async list(req, res, next) {
    try {
      const data = await promotionService.listPromotions();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async validate(req, res, next) {
    try {
      const { code, subtotal } = req.body;
      const data = await promotionService.validateCoupon(code, subtotal);
      res.json({
        success: true,
        message: `Đã áp dụng mã giảm giá ${data.code} thành công!`,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const data = await promotionService.createPromotion(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo mã ưu đãi khuyến mãi thành công',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async toggle(req, res, next) {
    try {
      const { id } = req.params;
      const data = await promotionService.togglePromotion(id);
      res.json({
        success: true,
        message: `Đã ${data.is_active ? 'kích hoạt' : 'tạm dừng'} mã khuyến mãi`,
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PromotionController();

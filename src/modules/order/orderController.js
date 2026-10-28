const orderService = require('./orderService');

class OrderController {
  async create(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const order = await orderService.createOrder({
        ...req.body,
        userId
      });

      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công!',
        data: order
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const { payment_status, fulfillment_status, search, page, limit } = req.query;
      const data = await orderService.listOrders({ payment_status, fulfillment_status, search, page, limit });
      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const email = req.user ? req.user.email : null;
      const data = await orderService.getMyOrders(userId, email);
      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getDetails(req, res, next) {
    try {
      const { idOrDisplayId } = req.params;
      const data = await orderService.getOrderDetails(idOrDisplayId, req.user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updatePayment(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const order = await orderService.updatePaymentStatus(id, status, note);
      res.json({
        success: true,
        message: 'Cập nhật trạng thái thanh toán thành công',
        data: order
      });
    } catch (err) {
      next(err);
    }
  }

  async updateFulfillment(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const order = await orderService.updateFulfillmentStatus(id, status, note);
      res.json({
        success: true,
        message: 'Cập nhật trạng thái giao vận thành công',
        data: order
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelMyOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};
      const order = await orderService.cancelMyOrder(id, req.user, reason);
      res.json({
        success: true,
        message: `Đã hủy đơn hàng #${order.display_id} và hoàn lại tồn kho`,
        data: order
      });
    } catch (err) {
      next(err);
    }
  }

  async expireStaleOrders(req, res, next) {
    try {
      const { timeoutMinutes = 30 } = req.body || {};
      const result = await orderService.expireStaleVietQROrders(timeoutMinutes);
      res.json({
        success: true,
        message:
          result.expiredCount > 0
            ? `Đã thu hồi ${result.expiredCount} đơn chờ VietQR quá hạn (${result.expiredDisplayIds.join(', ')})`
            : 'Không có đơn hàng chờ VietQR nào quá hạn thanh toán',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrderController();

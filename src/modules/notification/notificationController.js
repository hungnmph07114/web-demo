const notificationService = require('./notificationService');

class NotificationController {
  async getLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 30;
      const logs = await notificationService.getLogs(limit);
      res.json({
        success: true,
        data: logs
      });
    } catch (err) {
      next(err);
    }
  }

  async testNotification(req, res, next) {
    try {
      const { email, type = 'TEST' } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email nhận' });
      }

      const mockOrder = {
        id: 9999,
        display_id: 'TP-DEMO',
        customer_name: 'Khách hàng Thử nghiệm',
        customer_email: email,
        customer_phone: '0988123456',
        shipping_address: 'Tầng 12A, Keangnam Landmark 72, Nam Từ Liêm, Hà Nội',
        total_amount: 32990000,
        payment_status: 'captured',
        tracking_code: 'GHN-DEMO-998877',
        driver_name: 'Nguyễn Văn Hùng',
        driver_phone: '0988.234.567',
        vietqr_content: 'TP-DEMO 0988123456',
        vietqr_image: ''
      };

      let result;
      if (type === 'SHIPPING') {
        result = await notificationService.sendShippingNotification(mockOrder);
      } else if (type === 'PAYMENT') {
        result = await notificationService.sendPaymentSuccess(mockOrder);
      } else {
        result = await notificationService.sendOrderConfirmation(mockOrder, [
          {
            product_title: 'MacBook Pro 14 M3 Max (Demo)',
            variant_title: 'Space Black / 36GB / 1TB',
            sku: 'MBP14-M3M-01',
            quantity: 1,
            total_price: 32990000
          }
        ]);
      }

      res.json({
        success: true,
        message: 'Đã gửi email thử nghiệm thành công',
        result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();

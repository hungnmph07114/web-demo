const shippingService = require('./shippingService');

class ShippingController {
  async getShipmentTracking(req, res) {
    try {
      const { idOrDisplayId } = req.params;
      const data = await shippingService.getShipmentTracking(idOrDisplayId);
      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching shipment tracking:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCarrier(req, res) {
    try {
      const { orderId } = req.params;
      const { carrier, trackingCode, driverName, driverPhone } = req.body;
      const order = await shippingService.updateCarrier(orderId, {
        carrier,
        trackingCode,
        driverName,
        driverPhone
      });
      return res.json({
        success: true,
        message: 'Đã cập nhật thông tin hãng vận chuyển thành công!',
        data: order
      });
    } catch (error) {
      console.error('Error updating carrier:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async simulateNextStep(req, res) {
    try {
      const { orderId } = req.params;
      const result = await shippingService.simulateNextStep(orderId);
      return res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Error simulating shipping step:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ShippingController();

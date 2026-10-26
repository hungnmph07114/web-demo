const webhookService = require('./webhookService');

class WebhookController {
  /**
   * Endpoint tiếp nhận Webhook ngân hàng từ SePay, Casso, hoặc hệ thống Open Banking
   * POST /api/webhooks/vietqr
   */
  async handleBankTransfer(req, res, next) {
    try {
      const authHeader = req.headers['authorization'] || '';
      const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
      const apiKey = req.headers['x-api-key'] || bearerToken || req.query.apiKey;
      const configuredSecret =
        (process.env.WEBHOOK_SECRET && process.env.WEBHOOK_SECRET.trim()) ||
        (process.env.VIETQR_SECRET_TOKEN && process.env.VIETQR_SECRET_TOKEN.trim()) ||
        null;

      // Nếu hệ thống có cấu hình WEBHOOK_SECRET hoặc VIETQR_SECRET_TOKEN thì bắt buộc xác thực
      if (configuredSecret && apiKey !== configuredSecret) {
        return res.status(401).json({
          success: false,
          message: 'Webhook Secret Key không hợp lệ'
        });
      }

      const result = await webhookService.processBankTransfer(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Endpoint giả lập bắn Webhook cho Dev và Demo trên giao diện
   * POST /api/webhooks/vietqr/simulate
   */
  async simulateTransfer(req, res, next) {
    try {
      const { display_id, amount, bank_name } = req.body;
      if (!display_id) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mã đơn hàng display_id (VD: TP-8802)'
        });
      }

      const cleanDisplayId = String(display_id).trim().replace(/^#/, '').toUpperCase();

      const simulatedPayload = {
        gateway: bank_name || 'MB Bank (Simulator 24/7)',
        transactionDate: new Date().toISOString(),
        transferType: 'in',
        transferAmount: amount !== undefined && amount !== '' ? parseFloat(amount) : null,
        content: `${cleanDisplayId} GD THANH TOAN TEST SIMULATOR`,
        referenceCode: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        orderCode: cleanDisplayId,
        isSimulator: true
      };

      const result = await webhookService.processBankTransfer(simulatedPayload);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lấy lịch sử sự kiện Webhook (Admin only)
   * GET /api/webhooks/vietqr/logs
   */
  async getLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const logs = await webhookService.getRecentLogs(limit);
      res.json({
        success: true,
        data: logs
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WebhookController();

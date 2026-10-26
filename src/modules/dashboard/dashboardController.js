const dashboardService = require('./dashboardService');

class DashboardController {
  async getMetrics(req, res, next) {
    try {
      const data = await dashboardService.getStats();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();

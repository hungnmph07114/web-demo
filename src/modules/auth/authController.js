const authService = require('./authService');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async register(req, res, next) {
    try {
      const data = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      res.json({
        success: true,
        message: 'Đã cập nhật thông tin tài khoản thành công',
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.id, req.body);
      res.json({
        success: true,
        message: 'Đã đổi mật khẩu bảo mật thành công!'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'techpulse_modular_jwt_secret_key_2026';

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Yêu cầu đăng nhập để truy cập tài nguyên này'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn'
    });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Ignored for optional
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Từ chối quyền truy cập: Chỉ quản trị viên (Admin) mới có quyền thực hiện'
    });
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
  JWT_SECRET
};

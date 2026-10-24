/**
 * Centralized Error Handling Middlewares
 */

// 404 Handler cho cac API khong ton tai
function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'API endpoint không tồn tại',
      path: req.originalUrl
    });
  }
  next();
}

// 500 Global Error Handler
function globalErrorHandler(err, req, res, next) {
  console.error('🔥 Server Error:', err.stack || err.message);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Đã xảy ra lỗi nội bộ máy chủ',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};

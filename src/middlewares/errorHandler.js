function errorHandler(err, req, res, next) {
  console.error('💥 Unhandled Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy tài nguyên API: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};

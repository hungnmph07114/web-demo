/**
 * Security Headers & Sliding-Window Rate Limiter Middleware
 * Protects sensitive endpoints (/api/auth, /api/orders, /api/webhooks)
 */

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

function createRateLimiter({ windowMs = 60 * 1000, maxRequests = 30, message = 'Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.' } = {}) {
  const ipBuckets = new Map();

  // Dọn dẹp bộ nhớ định kỳ mỗi 2 phút
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of ipBuckets.entries()) {
      if (now - entry.startTime > windowMs) {
        ipBuckets.delete(key);
      }
    }
  }, 120 * 1000);

  if (typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref();
  }

  return function rateLimiterMiddleware(req, res, next) {
    const clientIp = req.ip || (typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'].split(',')[0].trim() : 'unknown');
    const now = Date.now();

    const record = ipBuckets.get(clientIp);
    if (!record || now - record.startTime > windowMs) {
      ipBuckets.set(clientIp, { count: 1, startTime: now });
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
}

const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  message: 'Bạn đã thử đăng nhập/đăng ký quá nhiều lần. Vui lòng đợi 1 phút trước khi thử lại.'
});

const orderRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Tần suất tạo đơn hàng quá nhanh. Vui lòng đợi giây lát.'
});

const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Quá giới hạn tần suất gọi Webhook.'
});

module.exports = {
  securityHeaders,
  createRateLimiter,
  authRateLimiter,
  orderRateLimiter,
  webhookRateLimiter
};

/**
 * Express Application Configuration
 * Modular Architecture inspired by MedusaJS
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes/api');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { securityHeaders } = require('./middlewares/security');

const app = express();

// Tin cậy reverse proxy (Render, Cloudflare, Nginx) để xác thực req.ip chính xác (SEC-08)
app.set('trust proxy', 1);

// HTTP Security Headers & CORS (SEC-10)
app.use(securityHeaders);
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : '*';
app.use(cors({ origin: allowedOrigins }));

// Giới hạn payload JSON hợp lý chống DoS (SEC-08)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Phục vụ thư mục ảnh tải lên (/uploads) cố định từ public/uploads
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (_) {
    // ignore
  }
}
app.use('/uploads', express.static(uploadsDir));

// Ưu tiên phục vụ bản build ReactJS (frontend/dist) nếu có, fallback sang public/
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const hasFrontendDist = fs.existsSync(frontendDist);
if (hasFrontendDist) {
  app.use(express.static(frontendDist));
} else {
  app.use(express.static(path.join(__dirname, '..', 'public')));
}

// Đảm bảo Database đã sẵn sàng trước khi xử lý các request /api/*
app.use('/api', async (req, res, next) => {
  try {
    if (app.locals.dbReadyPromise) {
      await app.locals.dbReadyPromise;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Mount toàn bộ API routes tại /api
app.use('/api', apiRoutes);

// Phục vụ SPA Client (Storefront & Admin) cho mọi đường dẫn non-API (PERF-04: Không gọi fs.existsSync đồng bộ lặp lại)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (hasFrontendDist) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Fallback error middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

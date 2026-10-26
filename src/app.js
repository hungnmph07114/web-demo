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

// Middlewares
app.use(securityHeaders);
app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

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
if (fs.existsSync(frontendDist)) {
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

// Phục vụ SPA Client (Storefront & Admin) cho mọi đường dẫn non-API
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (fs.existsSync(frontendDist)) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Fallback error middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

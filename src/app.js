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

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ưu tiên phục vụ bản build ReactJS (frontend/dist) nếu có, fallback sang public/
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
} else {
  app.use(express.static(path.join(__dirname, '..', 'public')));
}

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

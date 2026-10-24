/**
 * Express Application Configuration
 * Modular architecture for high scalability
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phuc vu static files tu thu muc public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount toan bo API routes tai /api
app.use('/api', apiRoutes);

// Fallback error middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;

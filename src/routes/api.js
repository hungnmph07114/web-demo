const express = require('express');
const router = express.Router();

const authController = require('../modules/auth/authController');
const productController = require('../modules/product/productController');
const promotionController = require('../modules/promotion/promotionController');
const orderController = require('../modules/order/orderController');
const dashboardController = require('../modules/dashboard/dashboardController');
const webhookController = require('../modules/webhook/webhookController');

const { authenticate, optionalAuth, requireAdmin } = require('../middlewares/auth');

// ==========================================
// 1. AUTHENTICATION & USER ROUTES
// ==========================================
router.post('/auth/login', (req, res, next) => authController.login(req, res, next));
router.post('/auth/register', (req, res, next) => authController.register(req, res, next));
router.get('/auth/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

// ==========================================
// 2. PRODUCT & CATEGORY ROUTES (MEDUSA-STYLE)
// ==========================================
router.get('/products/categories', (req, res, next) => productController.getCategories(req, res, next));
router.get('/products', (req, res, next) => productController.getProducts(req, res, next));
router.get('/products/:idOrSlug', (req, res, next) => productController.getProductByIdOrSlug(req, res, next));

// Admin Product Management
router.post('/products', authenticate, requireAdmin, (req, res, next) => productController.createProduct(req, res, next));
router.put('/products/:id', authenticate, requireAdmin, (req, res, next) => productController.updateProduct(req, res, next));
router.delete('/products/:id', authenticate, requireAdmin, (req, res, next) => productController.deleteProduct(req, res, next));
router.put('/products/variants/:variantId', authenticate, requireAdmin, (req, res, next) => productController.updateVariant(req, res, next));

// ==========================================
// 3. PROMOTIONS & VOUCHERS
// ==========================================
router.post('/promotions/validate', (req, res, next) => promotionController.validate(req, res, next));
router.get('/promotions', authenticate, requireAdmin, (req, res, next) => promotionController.list(req, res, next));
router.post('/promotions', authenticate, requireAdmin, (req, res, next) => promotionController.create(req, res, next));
router.patch('/promotions/:id/toggle', authenticate, requireAdmin, (req, res, next) => promotionController.toggle(req, res, next));

// ==========================================
// 4. ORDERS & DUAL STATE MACHINE & VIETQR
// ==========================================
router.post('/orders', optionalAuth, (req, res, next) => orderController.create(req, res, next));
router.get('/orders', authenticate, requireAdmin, (req, res, next) => orderController.list(req, res, next));
router.get('/orders/:idOrDisplayId', (req, res, next) => orderController.getDetails(req, res, next));
router.patch('/orders/:id/payment', authenticate, requireAdmin, (req, res, next) => orderController.updatePayment(req, res, next));
router.patch('/orders/:id/fulfillment', authenticate, requireAdmin, (req, res, next) => orderController.updateFulfillment(req, res, next));

// ==========================================
// 5. DASHBOARD & METRICS (ADMIN ONLY)
// ==========================================
router.get('/dashboard/metrics', authenticate, requireAdmin, (req, res, next) => dashboardController.getMetrics(req, res, next));

// ==========================================
// 6. VIETQR 24/7 BANK WEBHOOKS & SIMULATOR
// ==========================================
router.post('/webhooks/vietqr', (req, res, next) => webhookController.handleBankTransfer(req, res, next));
router.post('/webhooks/vietqr/simulate', (req, res, next) => webhookController.simulateTransfer(req, res, next));
router.get('/webhooks/vietqr/logs', authenticate, requireAdmin, (req, res, next) => webhookController.getLogs(req, res, next));

module.exports = router;

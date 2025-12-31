const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/Minh_paymentController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

// Payment creation and processing
router.post('/create', authMiddleware, paymentController.createPayment);
router.post('/momo/process', authMiddleware, paymentController.processMomoPayment);
router.post('/zalopay/process', authMiddleware, paymentController.processZaloPayPayment);
router.post('/paypal/process', authMiddleware, paymentController.processPayPalPayment);

// Payment callbacks (public - called by payment gateways)
router.post('/momo/callback', paymentController.handleMomoCallback);
router.post('/zalopay/callback', paymentController.handleZaloPayCallback);
router.post('/paypal/callback', paymentController.handlePayPalCallback);

// Payment status
router.get('/:paymentCode/status', authMiddleware, paymentController.getPaymentStatus);

// Refund (Admin only)
router.post('/:paymentCode/refund', authMiddleware, adminOnly, paymentController.refundPayment);

module.exports = router;

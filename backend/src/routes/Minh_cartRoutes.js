const express = require('express');
const router = express.Router();
const cartController = require('../controllers/Minh_cartController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.put('/items/:productId', cartController.updateCartItem);
router.delete('/items/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);
router.post('/voucher', cartController.applyVoucher);

module.exports = router;

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./Khanh_authRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const cartRoutes = require('./Minh_cartRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./Minh_paymentRoutes');
const voucherRoutes = require('./voucherRoutes');
const themeRoutes = require('./Nghi_themeRoutes');
const revenueRoutes = require('./Nghi_revenueRoutes');
const uploadRoutes = require('./uploadRoutes');
const analyticsRoutes = require('./Hung_analytics');
const notificationRoutes = require('./notificationRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/themes', themeRoutes);
router.use('/revenue', revenueRoutes);
router.use('/upload', uploadRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    message: 'Siêu Thị ABC API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      payment: '/api/payment',
      vouchers: '/api/vouchers',
      themes: '/api/themes',
      analytics: '/api/analytics (Admin only)',
      revenue: '/api/revenue (Admin only)',
      upload: '/api/upload (Admin only)'
    }
  });
});

module.exports = router;

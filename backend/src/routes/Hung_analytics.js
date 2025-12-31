const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/Hung_analyticsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

// Tất cả route yêu cầu quyền admin
router.use(authMiddleware);
router.use(adminOnly);

// Dashboard statistics
router.get('/dashboard', analyticsController.getDashboardStats);

// Linear Regression - Phân tích doanh thu
router.get('/revenue-analysis', analyticsController.getRevenueAnalysis);

// K-Means - Phân cụm sản phẩm
router.get('/product-clusters', analyticsController.getProductClusters);

// Decision Tree - Phân loại khách hàng
router.get('/customer-segmentation', analyticsController.getCustomerSegmentation);

// Top products
router.get('/top-products', analyticsController.getTopProducts);

// Monthly revenue
router.get('/monthly-revenue', analyticsController.getMonthlyRevenue);

module.exports = router;

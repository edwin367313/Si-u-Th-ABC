const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/Nghi_revenueController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

// All revenue routes require admin access
router.use(authMiddleware, adminOnly);

router.get('/overview', revenueController.getRevenueOverview);
router.get('/period', revenueController.getRevenueByPeriod);
router.get('/monthly', revenueController.getMonthlyRevenue);
router.get('/top-products', revenueController.getTopProducts);
router.get('/by-category', revenueController.getRevenueByCategory);
router.get('/export', revenueController.exportRevenueReport);

module.exports = router;

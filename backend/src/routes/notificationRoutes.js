const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

// Admin routes
router.get('/admin', authMiddleware, adminOnly, notificationController.getAdminNotifications);
router.put('/:id/read', authMiddleware, adminOnly, notificationController.markAsRead);
router.put('/read-all', authMiddleware, adminOnly, notificationController.markAllAsRead);

module.exports = router;

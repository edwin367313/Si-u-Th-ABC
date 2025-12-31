const express = require('express');
const router = express.Router();
const themeController = require('../controllers/Nghi_themeController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

// Public route
router.get('/active', themeController.getActiveTheme);

// Admin routes
router.get('/', authMiddleware, adminOnly, themeController.getAllThemes);
router.post('/', authMiddleware, adminOnly, themeController.createTheme);
router.put('/:id', authMiddleware, adminOnly, themeController.updateTheme);
router.delete('/:id', authMiddleware, adminOnly, themeController.deleteTheme);
router.put('/:id/activate', authMiddleware, adminOnly, themeController.setActiveTheme);

module.exports = router;

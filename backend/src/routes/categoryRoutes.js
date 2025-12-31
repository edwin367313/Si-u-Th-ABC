const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin routes
router.post('/', authMiddleware, adminOnly, categoryController.createCategory);
router.put('/:id', authMiddleware, adminOnly, categoryController.updateCategory);
router.delete('/:id', authMiddleware, adminOnly, categoryController.deleteCategory);

module.exports = router;

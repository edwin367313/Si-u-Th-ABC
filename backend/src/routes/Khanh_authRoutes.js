const express = require('express');
const router = express.Router();
const authController = require('../controllers/Khanh_authController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');
const { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../middlewares/validationMiddleware');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);

// Admin routes
router.get('/users', authMiddleware, adminOnly, authController.getAllUsers);
router.put('/users/:id', authMiddleware, adminOnly, authController.updateUser);
router.delete('/users/:id', authMiddleware, adminOnly, authController.deleteUser);

module.exports = router;

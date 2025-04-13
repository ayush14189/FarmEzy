const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', protect, authController.getUserProfile);
router.put('/profile', protect, authController.updateUserProfile);
router.post('/profile/analysis',protect, authController.addAnalysis);
router.put('/profile/analysis/:id',protect,authController.updateAnalysis);
router.get('/profile/analysis',protect,authController.getAnalysis);

module.exports = router; 
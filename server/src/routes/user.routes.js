const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');

// Placeholder route for user operations
router.get('/', protect, (req, res) => {
  res.json({ message: 'User routes are working' });
});

// Get all users (admin only)
router.get('/all', protect, admin, (req, res) => {
  res.json({ message: 'Admin route for getting all users' });
});

module.exports = router; 
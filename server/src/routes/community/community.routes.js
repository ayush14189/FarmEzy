const express = require('express');
const router = express.Router();
const communityController = require('../../controllers/community/community.controller');
const { protect } = require('../../middleware/auth.middleware');

// Public routes
router.get('/posts', communityController.getPosts);
router.get('/posts/:id', communityController.getPostById);

// Protected routes - require authentication
router.post('/posts', protect, communityController.createPost);
router.put('/posts/:id', protect, communityController.updatePost);
router.delete('/posts/:id', protect, communityController.deletePost);
router.post('/posts/:id/comments', protect, communityController.addComment);
router.post('/posts/:id/like', protect, communityController.likePost);

module.exports = router; 
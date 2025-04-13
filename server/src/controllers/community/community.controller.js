const CommunityPost = require('../../models/Community');
const mongoose = require('mongoose');

// Get all posts with optional filtering
exports.getPosts = async (req, res) => {
  try {
    const { category, search, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Apply category filter if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Apply search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { 'author.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await CommunityPost.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Get a specific post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, links, tags } = req.body;
    
    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content and category'
      });
    }
    
    // Create new post
    const post = new CommunityPost({
      author: {
        userId: req.user._id,
        name: req.user.name,
        farm: req.user.farmDetails?.location || 'Unknown Farm',
        location: req.user.farmDetails?.location || 'Unknown'
      },
      title,
      content,
      category,
      links: links || [],
      tags: tags || []
    });
    
    await post.save();
    
    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, category, links, tags } = req.body;
    const postId = req.params.id;
    
    // Find post
    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user owns the post
    if (post.author.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post'
      });
    }
    
    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (links) post.links = links;
    if (tags) post.tags = tags;
    
    post.updatedAt = Date.now();
    
    await post.save();
    
    res.status(200).json({
      success: true,
      data: post,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Find post
    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user owns the post or is admin
    if (post.author.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }
    
    await CommunityPost.findByIdAndDelete(postId);
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }
    
    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    post.comments.push({
      userId: req.user._id,
      userName: req.user.name,
      text
    });
    
    await post.save();
    
    res.status(200).json({
      success: true,
      data: post.comments[post.comments.length - 1],
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    
    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Increment like count
    post.likes += 1;
    await post.save();
    
    res.status(200).json({
      success: true,
      data: { likes: post.likes },
      message: 'Post liked successfully'
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
}; 
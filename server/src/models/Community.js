const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    farm: String,
    location: String
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['pest-control', 'soil-health', 'irrigation', 'crops', 'equipment', 'general']
  },
  links: [{
    url: {
      type: String,
      required: true
    },
    description: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  tags: [String],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
communityPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

module.exports = CommunityPost; 
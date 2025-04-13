const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const analysisSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  irrigation_needed: {
    type: Boolean,
    required: true,
  },
  fertilization_needed: {
    type: Boolean,
    required: true,
  },
});

const yieldPredictionSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
  },
  predictedYield: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  fieldSize: Number,
  unit: String,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['farmer', 'admin'],
      default: 'farmer',
    },
    farmDetails: {
      location: String,
      size: Number, // in acres/hectares
      cropTypes: [String],
      soilType: String,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    analysis: [analysisSchema],
    yieldPredictions: [yieldPredictionSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 
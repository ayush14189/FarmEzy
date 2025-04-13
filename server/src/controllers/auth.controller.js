const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, farmDetails } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      farmDetails,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmDetails: user.farmDetails,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmDetails: user.farmDetails,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.farmDetails = req.body.farmDetails || user.farmDetails;
      
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      if (req.file) {
        user.profilePicture = req.file.path;
      }
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        farmDetails: updatedUser.farmDetails,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add analysis data
 * @route   POST /api/auth/profile/analysis
 * @access  Private
 */
exports.addAnalysis = async (req, res) => {
  try {
    const { irrigation_needed, fertilization_needed } = req.body;

    const user = await User.findById(req.user._id);
    
    if (user) {
      user.analysis.push({
        date: new Date(),
        irrigation_needed,
        fertilization_needed,
      });

      await user.save();
      res.status(201).json({ message: 'Analysis added successfully', analysis: user.analysis });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update analysis data
 * @route   PUT /api/auth/profile/analysis/:id
 * @access  Private
 */
exports.updateAnalysis = async (req, res) => {
  try {

    const { id } = req.params;
    const { irrigation_needed, fertilization_needed } = req.body;
    console.log(irrigation_needed);
    console.log(fertilization_needed);

    const user = await User.findById(req.user._id);
    
    if (user) {
      const analysis = user.analysis.id(id);
      if (analysis) {
        analysis.irrigation_needed = irrigation_needed !== undefined ? irrigation_needed : analysis.irrigation_needed;
        analysis.fertilization_needed = fertilization_needed !== undefined ? fertilization_needed : analysis.fertilization_needed;

        await user.save();
        res.json({ message: 'Analysis updated successfully', analysis });
      } else {
        res.status(404).json({ message: 'Analysis not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
/**
 * @desc    Get user analysis data
 * @route   GET /api/auth/profile/analysis
 * @access  Private
 */
exports.getAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('analysis'); // Fetch only the analysis field
    
    if (user) {
      res.json(user.analysis);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
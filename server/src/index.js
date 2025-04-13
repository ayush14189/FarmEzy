const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes (will create these later)
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const leafAnalysisRoutes = require('./routes/leafAnalysis.routes');
const irrigationRoutes = require('./routes/irrigation.routes');
const predictiveAnalysisRoutes = require('./routes/predictiveAnalysis.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const communityRoutes = require('./routes/community/community.routes');

// Import database connection
const connectDB = require('./config/db');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaf-analysis', leafAnalysisRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/predictive-analysis', predictiveAnalysisRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/community', communityRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Smart Farming API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
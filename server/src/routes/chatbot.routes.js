const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Placeholder route for chatbot queries
router.post('/query', protect, (req, res) => {
  const { query } = req.body;
  
  let response = "I'm sorry, I don't have an answer for that yet.";
  
  // Simple keyword matching for demonstration
  if (query && query.toLowerCase().includes('water')) {
    response = "Most crops need 1-2 inches of water per week, depending on weather conditions and soil type.";
  } else if (query && query.toLowerCase().includes('fertilize')) {
    response = "The best time to fertilize most crops is early in the growing season. Always follow package instructions for application rates.";
  } else if (query && query.toLowerCase().includes('pest')) {
    response = "Integrated Pest Management (IPM) combines prevention, monitoring, and control methods to minimize pest damage with the least risk.";
  }
  
  res.json({ 
    message: 'Chatbot response',
    query,
    response
  });
});

module.exports = router; 
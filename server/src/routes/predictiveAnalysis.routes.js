const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const predictiveAnalysisController = require('../controllers/predictiveAnalysis/predictiveAnalysis.controller');

// Yield prediction endpoint
router.post('/predict-yield', protect, predictiveAnalysisController.predictYield);

// Market price prediction endpoint
router.post('/predict-market-prices', protect, predictiveAnalysisController.predictMarketPrices);

// Get user's historical predictions
router.get('/user-predictions', protect, predictiveAnalysisController.getUserPredictions);

module.exports = router; 
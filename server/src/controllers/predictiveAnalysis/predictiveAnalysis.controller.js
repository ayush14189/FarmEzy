const axios = require('axios');
const User = require('../../models/user.model');

// Predict crop yield based on input parameters
exports.predictYield = async (req, res) => {
  try {
    const { 
      cropType, 
      soilType, 
      irrigationLevel, 
      fertilizationLevel, 
      season, 
      plantingDate,
      fieldSize 
    } = req.body;

    // Validate required inputs
    if (!cropType || !soilType || !irrigationLevel || !fertilizationLevel || !fieldSize) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Call ML model API for prediction (in production, replace with actual API call)
    // For now, we'll simulate the response with realistic data
    const predictedYield = simulatePrediction(cropType, soilType, irrigationLevel, fertilizationLevel, season);
    
    // Calculate total yield based on field size
    const totalYield = predictedYield * fieldSize;
    
    // Generate response with useful insights
    const response = {
      success: true,
      data: {
        crop: cropType,
        predictedYield: {
          perAcre: predictedYield,
          total: totalYield,
          unit: getYieldUnit(cropType)
        },
        fieldSize: {
          value: fieldSize,
          unit: 'acres'
        },
        confidence: 0.85 + (Math.random() * 0.1).toFixed(2),
        insights: generateInsights(cropType, predictedYield, soilType, irrigationLevel, fertilizationLevel),
        recommendations: generateRecommendations(cropType, soilType, irrigationLevel, fertilizationLevel)
      }
    };

    // Save prediction to user history
    if (req.user) {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            yieldPredictions: {
              crop: cropType,
              predictedYield: predictedYield,
              date: new Date()
            }
          }
        });
      } catch (error) {
        console.error('Error saving prediction to user history:', error);
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in yield prediction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate yield prediction',
      error: error.message
    });
  }
};

// Predict market prices
exports.predictMarketPrices = async (req, res) => {
  try {
    const { cropType, harvestDate, quality, organic } = req.body;

    // Validate required inputs
    if (!cropType) {
      return res.status(400).json({
        success: false,
        message: 'Crop type is required'
      });
    }

    // Generate price forecast
    const priceForecast = simulateMarketPrices(cropType, harvestDate, quality, organic);

    res.status(200).json({
      success: true,
      data: {
        crop: cropType,
        currentPrice: priceForecast.currentPrice,
        forecastedPrice: priceForecast.forecastedPrice,
        priceRange: priceForecast.priceRange,
        priceTrend: priceForecast.trend,
        unit: priceForecast.unit,
        marketInsights: priceForecast.insights,
        confidenceLevel: priceForecast.confidence
      }
    });
  } catch (error) {
    console.error('Error in market price prediction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate market price prediction',
      error: error.message
    });
  }
};

// Get historical predictions for the user
exports.getUserPredictions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('yieldPredictions');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.yieldPredictions || []
    });
  } catch (error) {
    console.error('Error fetching user predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user predictions',
      error: error.message
    });
  }
};

// Helper functions for generating realistic predictions

function simulatePrediction(cropType, soilType, irrigationLevel, fertilizationLevel, season) {
  // Base yields for different crops (tons per acre)
  const baseYields = {
    'corn': 8.5,
    'wheat': 3.2,
    'rice': 4.5,
    'soybean': 3.0,
    'potato': 20.0,
    'tomato': 25.0,
    'cotton': 0.8,
    'coffee': 0.6
  };

  // Soil quality factors
  const soilFactors = {
    'clay': 0.9,
    'loam': 1.2,
    'sandy': 0.8,
    'silty': 1.0,
    'peaty': 1.1
  };

  // Irrigation factors
  const irrigationFactors = {
    'low': 0.7,
    'medium': 1.0,
    'high': 1.3
  };

  // Fertilization factors
  const fertilizationFactors = {
    'low': 0.6,
    'medium': 1.0,
    'high': 1.4
  };

  // Season factors
  const seasonFactors = {
    'spring': 1.1,
    'summer': 1.0,
    'fall': 0.9,
    'winter': 0.7
  };

  // Get base yield or default to average
  const baseYield = baseYields[cropType.toLowerCase()] || 5.0;
  
  // Calculate modifiers
  const soilModifier = soilFactors[soilType.toLowerCase()] || 1.0;
  const irrigationModifier = irrigationFactors[irrigationLevel.toLowerCase()] || 1.0;
  const fertilizationModifier = fertilizationFactors[fertilizationLevel.toLowerCase()] || 1.0;
  const seasonModifier = season ? (seasonFactors[season.toLowerCase()] || 1.0) : 1.0;
  
  // Random variation (+/- 10%)
  const randomFactor = 0.9 + (Math.random() * 0.2);
  
  // Calculate predicted yield with all factors
  const predictedYield = baseYield * soilModifier * irrigationModifier * fertilizationModifier * seasonModifier * randomFactor;
  
  // Return the result with 2 decimal precision
  return parseFloat(predictedYield.toFixed(2));
}

function simulateMarketPrices(cropType, harvestDate, quality = 'standard', organic = false) {
  // Base prices in USD per unit
  const basePrices = {
    'corn': { price: 5.75, unit: 'bushel' },
    'wheat': { price: 7.20, unit: 'bushel' },
    'rice': { price: 14.50, unit: 'cwt' },
    'soybean': { price: 13.80, unit: 'bushel' },
    'potato': { price: 12.50, unit: 'cwt' },
    'tomato': { price: 0.85, unit: 'pound' },
    'cotton': { price: 0.72, unit: 'pound' },
    'coffee': { price: 1.95, unit: 'pound' }
  };

  // Quality multipliers
  const qualityMultipliers = {
    'low': 0.8,
    'standard': 1.0,
    'premium': 1.35,
    'organic premium': 1.75
  };

  // Get base price for crop or default
  const basePrice = basePrices[cropType.toLowerCase()] || { price: 10.0, unit: 'unit' };
  
  // Apply quality multiplier
  let qualityMultiplier = qualityMultipliers[quality.toLowerCase()] || 1.0;
  
  // Extra premium for organic
  if (organic) {
    qualityMultiplier *= 1.4;
  }
  
  // Current market price
  const currentPrice = parseFloat((basePrice.price * qualityMultiplier).toFixed(2));
  
  // Random trend (-10% to +15%)
  const trendPercentage = -10 + (Math.random() * 25);
  const trend = trendPercentage >= 0 ? 'increasing' : 'decreasing';
  
  // Forecasted price
  const forecastedPrice = parseFloat((currentPrice * (1 + (trendPercentage / 100))).toFixed(2));
  
  // Price range
  const minPrice = parseFloat((forecastedPrice * 0.85).toFixed(2));
  const maxPrice = parseFloat((forecastedPrice * 1.15).toFixed(2));
  
  // Generate insights
  const insights = generateMarketInsights(cropType, trend, organic);
  
  return {
    currentPrice,
    forecastedPrice,
    priceRange: { min: minPrice, max: maxPrice },
    trend,
    unit: basePrice.unit,
    insights,
    confidence: parseFloat((0.7 + (Math.random() * 0.2)).toFixed(2))
  };
}

function getYieldUnit(cropType) {
  const units = {
    'corn': 'bushels/acre',
    'wheat': 'bushels/acre',
    'rice': 'cwt/acre',
    'soybean': 'bushels/acre',
    'potato': 'cwt/acre',
    'tomato': 'tons/acre',
    'cotton': 'bales/acre',
    'coffee': 'tons/acre'
  };
  
  return units[cropType.toLowerCase()] || 'tons/acre';
}

function generateInsights(cropType, predictedYield, soilType, irrigationLevel, fertilizationLevel) {
  const insights = [];
  
  // Add crop-specific insights
  if (cropType.toLowerCase() === 'corn' && predictedYield > 9) {
    insights.push('Your predicted corn yield is above the national average of 8.9 bushels/acre');
  } else if (cropType.toLowerCase() === 'wheat' && predictedYield > 3.5) {
    insights.push('Your predicted wheat yield is above the national average of 3.4 bushels/acre');
  }
  
  // Add soil insights
  if (soilType.toLowerCase() === 'loam') {
    insights.push('Loam soil provides excellent growing conditions for most crops');
  } else if (soilType.toLowerCase() === 'clay') {
    insights.push('Clay soil retains water well but may need additional aeration');
  } else if (soilType.toLowerCase() === 'sandy') {
    insights.push('Sandy soil drains quickly and may require more frequent irrigation');
  }
  
  // Add irrigation insights
  if (irrigationLevel.toLowerCase() === 'high') {
    insights.push('High irrigation levels provide optimal water but consider costs and sustainability');
  } else if (irrigationLevel.toLowerCase() === 'low') {
    insights.push('Low irrigation may stress crops during dry periods');
  }
  
  // Add fertilization insights
  if (fertilizationLevel.toLowerCase() === 'high') {
    insights.push('High fertilization can boost yields but watch for runoff and environmental impact');
  } else if (fertilizationLevel.toLowerCase() === 'low') {
    insights.push('Consider increasing fertilization to improve yields');
  }
  
  return insights;
}

function generateRecommendations(cropType, soilType, irrigationLevel, fertilizationLevel) {
  const recommendations = [];
  
  // Irrigation recommendations
  if (irrigationLevel.toLowerCase() === 'low' && soilType.toLowerCase() === 'sandy') {
    recommendations.push('Increase irrigation frequency for sandy soil to prevent water stress');
  } else if (irrigationLevel.toLowerCase() === 'high' && soilType.toLowerCase() === 'clay') {
    recommendations.push('Consider reducing irrigation to prevent waterlogging in clay soil');
  }
  
  // Fertilization recommendations
  if (fertilizationLevel.toLowerCase() === 'low') {
    recommendations.push('Consider soil testing to optimize fertilizer application');
  } else if (fertilizationLevel.toLowerCase() === 'high') {
    recommendations.push('Monitor for nutrient runoff and consider split applications');
  }
  
  // Crop-specific recommendations
  if (cropType.toLowerCase() === 'corn') {
    recommendations.push('Consider narrower row spacing to maximize yield potential');
  } else if (cropType.toLowerCase() === 'wheat') {
    recommendations.push('Monitor for rust and fusarium head blight during humid conditions');
  } else if (cropType.toLowerCase() === 'soybean') {
    recommendations.push('Consider inoculation to enhance nitrogen fixation');
  }
  
  return recommendations;
}

function generateMarketInsights(cropType, trend, organic) {
  const insights = [];
  
  // Trend-based insights
  if (trend === 'increasing') {
    insights.push(`${cropType} prices are trending upward. Consider delaying sales if storage is available.`);
  } else {
    insights.push(`${cropType} prices are trending downward. Consider securing forward contracts now.`);
  }
  
  // Add organic insights
  if (organic) {
    insights.push(`Organic ${cropType} commands a significant premium in current markets.`);
    insights.push('Demand for organic products continues to grow annually.');
  }
  
  // Add crop-specific market insights
  if (cropType.toLowerCase() === 'corn') {
    insights.push('Ethanol demand remains a key price driver for corn markets.');
  } else if (cropType.toLowerCase() === 'wheat') {
    insights.push('Global wheat supplies are affected by ongoing conflicts in major production regions.');
  } else if (cropType.toLowerCase() === 'coffee') {
    insights.push('Specialty coffee market continues to expand, offering premium opportunities.');
  }
  
  return insights;
} 
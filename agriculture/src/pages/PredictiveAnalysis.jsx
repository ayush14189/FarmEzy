import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaLeaf, FaDollarSign, FaHistory, FaChartBar, FaChartArea, FaCalculator } from 'react-icons/fa';
import axios from 'axios';

const PredictiveAnalysis = ({ user }) => {
  const [activeTab, setActiveTab] = useState('yield');
  const [loading, setLoading] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [historicalPredictions, setHistoricalPredictions] = useState([]);
  const [error, setError] = useState(null);

  // Form state for yield prediction
  const [yieldForm, setYieldForm] = useState({
    cropType: 'corn',
    soilType: 'loam',
    irrigationLevel: 'medium',
    fertilizationLevel: 'medium',
    season: 'summer',
    fieldSize: 10
  });

  // Form state for market prediction
  const [marketForm, setMarketForm] = useState({
    cropType: 'corn',
    harvestDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
    quality: 'standard',
    organic: false
  });

  // Fetch user's historical predictions on component mount
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistoricalPredictions();
    }
  }, [activeTab]);

  const fetchHistoricalPredictions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/predictive-analysis/user-predictions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoricalPredictions(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prediction history:', err);
      setError('Failed to fetch prediction history. Please try again.');
      setLoading(false);
    }
  };

  const handleYieldFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setYieldForm({
      ...yieldForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMarketFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMarketForm({
      ...marketForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleYieldPrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictionData(null);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/predictive-analysis/predict-yield',
        yieldForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPredictionData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error making yield prediction:', err);
      setError('Failed to generate prediction. Please try again.');
      setLoading(false);
    }
  };

  const handleMarketPrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictionData(null);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/predictive-analysis/predict-market-prices',
        marketForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPredictionData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error making market prediction:', err);
      setError('Failed to generate prediction. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-b from-purple-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <FaChartLine className="text-purple-600 mr-3" />
            Predictive Analysis
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Make data-driven decisions with insights on crop yields, market trends, and optimal harvest times.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-2 flex flex-wrap">
          <button
            onClick={() => setActiveTab('yield')}
            className={`flex items-center px-4 py-2 rounded-lg mr-2 mb-2 md:mb-0 ${
              activeTab === 'yield' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaLeaf className="mr-2" /> Yield Prediction
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center px-4 py-2 rounded-lg mr-2 mb-2 md:mb-0 ${
              activeTab === 'market' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaDollarSign className="mr-2" /> Market Price Forecast
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'history' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaHistory className="mr-2" /> Prediction History
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden p-6"
          >
            {activeTab === 'yield' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaCalculator className="text-purple-600 mr-2" />
                  Crop Yield Prediction
                </h2>
                
                <form onSubmit={handleYieldPrediction} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                      <select
                        name="cropType"
                        value={yieldForm.cropType}
                        onChange={handleYieldFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="corn">Corn</option>
                        <option value="wheat">Wheat</option>
                        <option value="rice">Rice</option>
                        <option value="soybean">Soybean</option>
                        <option value="potato">Potato</option>
                        <option value="tomato">Tomato</option>
                        <option value="cotton">Cotton</option>
                        <option value="coffee">Coffee</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                      <select
                        name="soilType"
                        value={yieldForm.soilType}
                        onChange={handleYieldFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="clay">Clay</option>
                        <option value="loam">Loam</option>
                        <option value="sandy">Sandy</option>
                        <option value="silty">Silty</option>
                        <option value="peaty">Peaty</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Level</label>
                      <select
                        name="irrigationLevel"
                        value={yieldForm.irrigationLevel}
                        onChange={handleYieldFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fertilization Level</label>
                      <select
                        name="fertilizationLevel"
                        value={yieldForm.fertilizationLevel}
                        onChange={handleYieldFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Growing Season</label>
                      <select
                        name="season"
                        value={yieldForm.season}
                        onChange={handleYieldFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="spring">Spring</option>
                        <option value="summer">Summer</option>
                        <option value="fall">Fall</option>
                        <option value="winter">Winter</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field Size (acres)</label>
                      <input
                        type="number"
                        name="fieldSize"
                        value={yieldForm.fieldSize}
                        onChange={handleYieldFormChange}
                        min="0.1"
                        step="0.1"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                  >
                    {loading ? 'Generating Prediction...' : 'Predict Yield'}
                  </button>
                </form>
              </>
            )}
            
            {activeTab === 'market' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaDollarSign className="text-purple-600 mr-2" />
                  Market Price Forecast
                </h2>
                
                <form onSubmit={handleMarketPrediction} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                    <select
                      name="cropType"
                      value={marketForm.cropType}
                      onChange={handleMarketFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="corn">Corn</option>
                      <option value="wheat">Wheat</option>
                      <option value="rice">Rice</option>
                      <option value="soybean">Soybean</option>
                      <option value="potato">Potato</option>
                      <option value="tomato">Tomato</option>
                      <option value="cotton">Cotton</option>
                      <option value="coffee">Coffee</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
                    <input
                      type="date"
                      name="harvestDate"
                      value={marketForm.harvestDate}
                      onChange={handleMarketFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality Level</label>
                    <select
                      name="quality"
                      value={marketForm.quality}
                      onChange={handleMarketFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="organic"
                      name="organic"
                      checked={marketForm.organic}
                      onChange={handleMarketFormChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="organic" className="ml-2 block text-sm text-gray-700">
                      Organic Certification
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                  >
                    {loading ? 'Generating Forecast...' : 'Predict Market Price'}
                  </button>
                </form>
              </>
            )}
            
            {activeTab === 'history' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaHistory className="text-purple-600 mr-2" />
                  Your Prediction History
                </h2>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : historicalPredictions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {historicalPredictions.map((prediction, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(prediction.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {prediction.crop.charAt(0).toUpperCase() + prediction.crop.slice(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {prediction.predictedYield} {prediction.unit || getYieldUnit(prediction.crop)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      You don't have any prediction history yet. Make some predictions to see them here!
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Right Column: Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaChartBar className="text-purple-600 mr-2" />
              Prediction Results
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : predictionData ? (
              <div className="space-y-6">
                {activeTab === 'yield' && (
                  <>
                    {/* Yield prediction results */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <h3 className="font-semibold text-lg text-purple-800 mb-2">
                        Predicted Yield for {predictionData.crop.charAt(0).toUpperCase() + predictionData.crop.slice(1)}
                      </h3>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-4xl font-bold text-purple-700">
                            {predictionData.predictedYield.perAcre} <span className="text-lg font-normal">{predictionData.predictedYield.unit}</span>
                          </p>
                          <p className="text-sm text-gray-500">Per acre yield</p>
                        </div>
                        <div>
                          <p className="text-4xl font-bold text-purple-700">
                            {predictionData.predictedYield.total.toFixed(2)} <span className="text-lg font-normal">{predictionData.predictedYield.unit}</span>
                          </p>
                          <p className="text-sm text-gray-500">Total yield for {predictionData.fieldSize.value} acres</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center p-2 bg-purple-100 rounded mb-4">
                        <p className="text-sm text-purple-800">
                          Confidence Level: {(predictionData.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    {/* Insights */}
                    {predictionData.insights && predictionData.insights.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-2">Insights</h3>
                        <ul className="space-y-2">
                          {predictionData.insights.map((insight, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <span className="text-sm text-gray-700">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {predictionData.recommendations && predictionData.recommendations.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h3 className="font-semibold text-green-800 mb-2">Recommendations</h3>
                        <ul className="space-y-2">
                          {predictionData.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-sm text-gray-700">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'market' && (
                  <>
                    {/* Market price prediction results */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <h3 className="font-semibold text-lg text-purple-800 mb-2">
                        Market Price Forecast for {predictionData.crop.charAt(0).toUpperCase() + predictionData.crop.slice(1)}
                      </h3>
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Current Price:</span>
                          <span className="text-sm font-semibold">${predictionData.currentPrice}/{predictionData.unit}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Forecasted Price:</span>
                          <span className="text-lg font-bold text-purple-700">${predictionData.forecastedPrice}/{predictionData.unit}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Price Range:</span>
                          <span className="text-sm">${predictionData.priceRange.min} - ${predictionData.priceRange.max}/{predictionData.unit}</span>
                        </div>
                      </div>
                      <div className={`flex items-center justify-center p-2 rounded mb-4 ${
                        predictionData.priceTrend === 'increasing' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <p className={`text-sm ${
                          predictionData.priceTrend === 'increasing' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          Price Trend: {predictionData.priceTrend === 'increasing' ? 'Increasing ↑' : 'Decreasing ↓'}
                        </p>
                      </div>
                    </div>

                    {/* Market Insights */}
                    {predictionData.marketInsights && predictionData.marketInsights.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-2">Market Insights</h3>
                        <ul className="space-y-2">
                          {predictionData.marketInsights.map((insight, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <span className="text-sm text-gray-700">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-center p-2 bg-purple-100 rounded">
                      <p className="text-sm text-purple-800">
                        Confidence Level: {(predictionData.confidenceLevel * 100).toFixed(0)}%
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                  <FaChartArea size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Prediction Yet</h3>
                <p className="text-gray-600 max-w-md">
                  {activeTab === 'yield' 
                    ? 'Fill out the yield prediction form to get AI-powered crop yield forecasts.' 
                    : activeTab === 'market'
                      ? 'Fill out the market prediction form to get price forecasts and trends.' 
                      : 'View your prediction history or make new predictions.'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const getYieldUnit = (cropType) => {
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
};

export default PredictiveAnalysis; 
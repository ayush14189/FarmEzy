import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCloudRain, FaSeedling, FaWater, FaCheckCircle, FaTimesCircle, FaPlus } from 'react-icons/fa';
import axios from 'axios';

const SmartIrrigation = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [previousResults, setPreviousResults] = useState([]);
  const resultsRef = useRef(null);

  const [formData, setFormData] = useState({
    "Sand %": 40,
    "Clay %": 30,
    "Silt %": 30,
    "pH": 6.5,
    "EC mS/cm": 0.8,
    "O.M. %": 1.5,
    "CACO3 %": 2,
    "N_NO3 ppm": 30,
    "P ppm": 19,
    "K ppm": 100,
    "Mg ppm": 50,
    "Fe ppm": 2.5,
    "Zn ppm": 1.5,
    "Mn ppm": 2,
    "Cu ppm": 0.5,
    "B ppm": 0.4,
    "Moisture %": 18,
    "Temperature °C": 35,
    "Rainfall mm": 2
  });

  useEffect(() => {
    const fetchPreviousAnalysis = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/profile/analysis', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPreviousResults(response.data);
      } catch (error) {
        console.error('Error fetching previous analysis:', error);
      }
    };

    fetchPreviousAnalysis();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call the API to analyze soil
      const response = await axios.post('http://localhost:5050/predict/soil-analysis', formData);
      setResults(response.data);
      console.log(response.data);
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });

      // Fetch token from local storage
      const token = localStorage.getItem('token');

      // Call the API to store analysis results
      await axios.post('http://localhost:5000/api/auth/profile/analysis', {
        irrigation_needed: response.data.irrigation_needed,
        fertilization_needed: response.data.fertilization_needed,
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Use the fetched token
        },
      });

    } catch (error) {
      console.error('Error submitting soil analysis:', error);
      alert('Failed to analyze soil. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-b from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <FaCloudRain className="text-blue-600 mr-3" />
            Smart Irrigation & Fertilization
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Analyze your soil composition to get AI-powered recommendations for irrigation and fertilization based on soil conditions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Soil Analysis Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaSeedling className="text-green-600 mr-2" />
              Soil Analysis Parameters
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Soil Composition */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-3">Soil Composition</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Sand %</label>
                      <input 
                        type="number" 
                        name="Sand %" 
                        value={formData["Sand %"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Clay %</label>
                      <input 
                        type="number" 
                        name="Clay %" 
                        value={formData["Clay %"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Silt %</label>
                      <input 
                        type="number" 
                        name="Silt %" 
                        value={formData["Silt %"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Soil Properties */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-3">Soil Properties</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">pH</label>
                      <input 
                        type="number" 
                        name="pH" 
                        value={formData["pH"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">EC (mS/cm)</label>
                      <input 
                        type="number" 
                        name="EC mS/cm" 
                        value={formData["EC mS/cm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Organic Matter %</label>
                      <input 
                        type="number" 
                        name="O.M. %" 
                        value={formData["O.M. %"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">CaCO₃ %</label>
                      <input 
                        type="number" 
                        name="CACO3 %" 
                        value={formData["CACO3 %"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Nutrients */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Nutrients (ppm)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">N (NO₃) ppm</label>
                      <input 
                        type="number" 
                        name="N_NO3 ppm" 
                        value={formData["N_NO3 ppm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">P ppm</label>
                      <input 
                        type="number" 
                        name="P ppm" 
                        value={formData["P ppm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">K ppm</label>
                      <input 
                        type="number" 
                        name="K ppm" 
                        value={formData["K ppm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Mg ppm</label>
                      <input 
                        type="number" 
                        name="Mg ppm" 
                        value={formData["Mg ppm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Fe ppm</label>
                      <input 
                        type="number" 
                        name="Fe ppm" 
                        value={formData["Fe ppm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Zn ppm</label>
                      <input 
                        type="number" 
                        name="Zn ppm" 
                        value={formData["Zn ppm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Mn ppm</label>
                      <input 
                        type="number" 
                        name="Mn ppm" 
                        value={formData["Mn ppm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Cu ppm</label>
                      <input 
                        type="number" 
                        name="Cu ppm" 
                        value={formData["Cu ppm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">B ppm</label>
                      <input 
                        type="number" 
                        name="B ppm" 
                        value={formData["B ppm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Environmental Factors */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Environmental Factors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Moisture %</label>
                      <input 
                        type="number" 
                        name="Moisture %" 
                        value={formData["Moisture %"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Temperature °C</label>
                      <input 
                        type="number" 
                        name="Temperature °C" 
                        value={formData["Temperature °C"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Rainfall (mm)</label>
                      <input 
                        type="number" 
                        name="Rainfall mm" 
                        value={formData["Rainfall mm"] || ""} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaWater className="mr-2" />
                    Analyze Soil
                  </span>
                )}
              </button>
            </form>
          </motion.div>

          {/* Results Section */}
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaCloudRain className="text-blue-600 mr-2" />
              Analysis Results
            </h2>

            {results ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Irrigation Result */}
                  <div className={`p-4 rounded-lg flex items-start ${results.irrigation_needed ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${results.irrigation_needed ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                      {results.irrigation_needed ? <FaCheckCircle size={20} /> : <FaTimesCircle size={20} />}
                    </div>
                    <div className="ml-4">
                      <h3 className={`font-bold ${results.irrigation_needed ? 'text-blue-700' : 'text-gray-700'}`}>
                        Irrigation {results.irrigation_needed ? 'Needed' : 'Not Needed'}
                      </h3>
                      <p className="text-sm mt-1">{results.irrigation_recommendations}</p>
                    </div>
                  </div>

                  {/* Fertilization Result */}
                  <div className={`p-4 rounded-lg flex items-start ${results.fertilization_needed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${results.fertilization_needed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                      {results.fertilization_needed ? <FaCheckCircle size={20} /> : <FaTimesCircle size={20} />}
                    </div>
                    <div className="ml-4">
                      <h3 className={`font-bold ${results.fertilization_needed ? 'text-green-700' : 'text-gray-700'}`}>
                        Fertilization {results.fertilization_needed ? 'Needed' : 'Not Needed'}
                      </h3>
                      <p className="text-sm mt-1">{results.fertilization_recommendations}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">What does this mean?</h3>
                  <p className="text-sm text-gray-700">
                    Based on your soil analysis, our AI model has determined whether your crops need irrigation and fertilization. Follow the recommendations above to optimize your farming operations and improve crop yield.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <FaCloudRain size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Analysis Yet</h3>
                <p className="text-gray-600 max-w-md">
                  Enter your soil parameters and submit the form to get AI-powered recommendations for irrigation and fertilization.
                </p>
              </div>
            )}

            {/* Previous Analysis Results */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Previous Analysis Results</h2>
              {previousResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="w-full bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Analysis Date</th>
                        <th className="py-3 px-6 text-left">Irrigation Needed</th>
                        <th className="py-3 px-6 text-left">Fertilization Needed</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                      {previousResults.map((analysis, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                          <td className="py-3 px-6">{new Date(analysis.date).toLocaleDateString()}</td>
                          <td className="py-3 px-6">{analysis.irrigation_needed ? 'Yes' : 'No'}</td>
                          <td className="py-3 px-6">{analysis.fertilization_needed ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No previous analysis found.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SmartIrrigation;
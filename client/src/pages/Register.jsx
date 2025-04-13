import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaMapMarkerAlt, FaSeedling, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

const Register = ({ login }) => {
  const navigate = useNavigate();
  
  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    farmDetails: {
      location: '',
      size: '',
      cropTypes: [],
      soilType: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Available crop types
  const cropOptions = ['Rice', 'Wheat', 'Corn', 'Potato', 'Tomato', 'Cotton', 'Sugarcane', 'Soybean'];
  const soilTypes = ['Clay', 'Sandy', 'Silty', 'Peaty', 'Chalky', 'Loamy'];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle crop type selection
  const handleCropToggle = (crop) => {
    const currentCrops = [...formData.farmDetails.cropTypes];
    
    if (currentCrops.includes(crop)) {
      // Remove crop if already selected
      const updatedCrops = currentCrops.filter(c => c !== crop);
      setFormData({
        ...formData,
        farmDetails: {
          ...formData.farmDetails,
          cropTypes: updatedCrops
        }
      });
    } else {
      // Add crop if not selected
      setFormData({
        ...formData,
        farmDetails: {
          ...formData.farmDetails,
          cropTypes: [...currentCrops, crop]
        }
      });
    }
  };

  // Navigate to next step
  const nextStep = () => {
    if (step === 1) {
      // Validate first step
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    
    setError(null);
    setStep(step + 1);
  };

  // Go back to previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        farmDetails: formData.farmDetails
      };

      // Call register API
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      // Store token in local storage
      localStorage.setItem('token', response.data.token);

      // If successful, login the user
      login(response.data, response.data.token);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 flex flex-col justify-center items-center px-4 bg-gradient-to-b from-green-50 to-blue-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-64 h-64 text-green-200 opacity-20 transform rotate-12">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M20,180 Q60,120 20,60 Q80,100 140,60 Q100,120 140,180 Q80,140 20,180 Z" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 text-green-200 opacity-20 transform -rotate-12">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M100,20 Q140,80 180,40 Q120,100 180,160 Q140,120 100,180 Q60,120 20,160 Q80,100 20,40 Q60,80 100,20 Z" />
        </svg>
      </div>

      <motion.div
        className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-lg relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-green-600 text-white px-6 py-4">
          <div className="flex items-center justify-center mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
            >
              <FaLeaf className="text-green-300 text-2xl mr-2" />
            </motion.div>
            <h2 className="text-2xl font-bold">Join AI Smart Farming</h2>
          </div>
          <p className="text-center text-green-100">Create your account to access all features</p>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center w-2/3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-green-500' : 'bg-green-400/50'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 ${
                step >= 2 ? 'bg-green-500' : 'bg-green-400/50'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-green-500' : 'bg-green-400/50'
              }`}>
                2
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {error && (
            <motion.div 
              className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Create a password"
                      required
                      minLength={6}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FaEye className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Confirm your password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Next
                    <FaChevronRight className="ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Farm Details */}
            {step === 2 && (
              <motion.div 
                key="step2"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <label htmlFor="location" className="block text-gray-700 font-medium mb-2">Farm Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      id="location"
                      name="farmDetails.location"
                      type="text"
                      value={formData.farmDetails.location}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="size" className="block text-gray-700 font-medium mb-2">Farm Size (in acres)</label>
                  <input
                    id="size"
                    name="farmDetails.size"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.farmDetails.size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Enter farm size"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Crop Types</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cropOptions.map((crop) => (
                      <div 
                        key={crop}
                        onClick={() => handleCropToggle(crop)}
                        className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          formData.farmDetails.cropTypes.includes(crop)
                            ? 'bg-green-100 border-green-600 text-green-800 border-2'
                            : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FaSeedling className={`mr-2 ${
                          formData.farmDetails.cropTypes.includes(crop) ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <span>{crop}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="soilType" className="block text-gray-700 font-medium mb-2">Soil Type</label>
                  <select
                    id="soilType"
                    name="farmDetails.soilType"
                    value={formData.farmDetails.soilType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select soil type</option>
                    {soilTypes.map((soil) => (
                      <option key={soil} value={soil}>{soil}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center bg-transparent border border-green-600 text-green-600 hover:bg-green-50 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">Already have an account?</p>
            <Link
              to="/login"
              className="mt-2 inline-block text-green-600 hover:text-green-700 font-medium"
            >
              Log in to your account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register; 
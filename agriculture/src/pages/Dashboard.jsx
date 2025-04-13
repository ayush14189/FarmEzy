import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaSeedling, FaCloudRain, FaChartLine, FaRobot, FaCalendarAlt, FaCloudSun, FaStore, FaUsers, FaSync, FaWind, FaSearch } from 'react-icons/fa';
import { BsCloudDrizzle, BsCloudSnow, BsSun, BsMoisture } from 'react-icons/bs';
import { WiDayLightning, WiDayWindy, WiHumidity } from 'react-icons/wi';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [location, setLocation] = useState('New York');

  const [alerts, setAlerts] = useState([]);

  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const [taskSuggestions, setTaskSuggestions] = useState([]);

  useEffect(() => {
    // Try to get user's location when component mounts
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/profile/analysis', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const recentAnalysis = response.data[response.data.length - 1]; // Get the most recent analysis
        if (recentAnalysis) {
          const tasks = [];
          if (recentAnalysis.irrigation_needed) {
            tasks.push({
              id: 'irrigation',
              title: 'Irrigation Needed',
              status: 'Pending',
              type: 'irrigation_needed',
              analysisId: recentAnalysis._id
            });
          }
          if (recentAnalysis.fertilization_needed) {
            tasks.push({
              id: 'fertilization',
              title: 'Fertilization Needed',
              status: 'Pending',
              type: 'fertilization_needed',
              analysisId: recentAnalysis._id
            });
          }
          setUpcomingTasks(tasks);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
      }
    };

    fetchAnalysis();
  }, []);

  useEffect(() => {
    if (currentWeather) {
      // Generate weather-based alerts when weather data is available
      const weatherAlerts = generateWeatherAlerts(currentWeather);
      setAlerts(weatherAlerts);
      
      // Generate weather-based tasks
      const weatherTasks = generateWeatherTasks(currentWeather);
      
      // Combine with existing tasks from analysis
      setTaskSuggestions(weatherTasks);
    }
  }, [currentWeather]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Keep the default location if geolocation fails
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setWeatherError("Geolocation is not supported by this browser");
    }
  };

  const fetchWeatherData = async () => {
    setWeatherLoading(true);
    try {
      const API_KEY = 'b7db56bcadd84abf9d9154542250104';
      const BASE_URL = 'https://api.weatherapi.com/v1';
      
      // Current weather data
      const currentResponse = await axios.get(`${BASE_URL}/current.json`, {
        params: {
          key: API_KEY,
          q: location,
          aqi: 'no'
        }
      });
      
      if (currentResponse.data) {
        // Process current weather
        const current = currentResponse.data.current;
        const locationData = currentResponse.data.location;
        
        setCurrentWeather({
          temperature: current.temp_c,
          condition: current.condition.text,
          humidity: current.humidity,
          windSpeed: current.wind_kph,
          precipitation: current.precip_mm,
          pressure: current.pressure_mb,
          uvIndex: current.uv,
          feelsLike: current.feelslike_c,
          icon: current.condition.icon,
          lastUpdated: current.last_updated,
          locationName: `${locationData.region}, ${locationData.country}`
        });
      }
      
      setWeatherLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setWeatherError('Failed to fetch weather data. Please try again later.');
      setWeatherLoading(false);
    }
  };

  const getWeatherIcon = (condition, icon) => {
    // If we have an icon URL from the API, use it
    if (icon) {
      return <img src={`https:${icon}`} alt={condition} className="w-12 h-12" />;
    }
    
    // Fallback to our custom icons
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return <BsSun className="text-yellow-500 text-5xl" />;
    } else if (conditionLower.includes('partly cloudy') || conditionLower.includes('cloudy')) {
      return <FaCloudSun className="text-gray-400 text-5xl" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <BsCloudDrizzle className="text-blue-400 text-5xl" />;
    } else if (conditionLower.includes('thunder') || conditionLower.includes('lightning')) {
      return <WiDayLightning className="text-purple-500 text-5xl" />;
    } else if (conditionLower.includes('snow')) {
      return <BsCloudSnow className="text-blue-200 text-5xl" />;
    } else if (conditionLower.includes('wind')) {
      return <WiDayWindy className="text-gray-400 text-5xl" />;
    } else {
      return <FaCloudSun className="text-gray-400 text-5xl" />;
    }
  };

  const markTaskAsDone = async (analysisId, type) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/auth/profile/analysis/${analysisId}`, {
        [type]: false // Update the specific task to not needed
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUpcomingTasks(prevTasks => prevTasks.filter(task => task.analysisId !== analysisId));
    } catch (error) {
      console.error('Error updating analysis:', error);
    }
  };

  const generateWeatherAlerts = (weather) => {
    if (!weather) return [];
    
    const newAlerts = [];
    
    // Temperature-based alerts
    if (weather.temperature > 30) {
      newAlerts.push({
        id: 'high-temp-' + Date.now(),
        type: 'warning', 
        message: `High temperature alert (${weather.temperature}°C). Consider increasing irrigation.`
      });
    }
    
    // Humidity-based alerts
    if (weather.humidity > 80) {
      newAlerts.push({
        id: 'high-humidity-' + Date.now(),
        type: 'warning',
        message: `High humidity (${weather.humidity}%). Monitor crops for fungal diseases.`
      });
    } else if (weather.humidity < 30) {
      newAlerts.push({
        id: 'low-humidity-' + Date.now(),
        type: 'warning',
        message: `Low humidity (${weather.humidity}%). Crops may need additional water.`
      });
    }
    
    // Precipitation-based alerts
    if (weather.precipitation > 5) {
      newAlerts.push({
        id: 'heavy-rain-' + Date.now(),
        type: 'info',
        message: `Significant rainfall detected (${weather.precipitation}mm). Skip irrigation today.`
      });
    } else if (weather.precipitation < 0.5 && weather.temperature > 25) {
      newAlerts.push({
        id: 'dry-condition-' + Date.now(),
        type: 'warning',
        message: 'Dry conditions detected. Consider irrigation for vulnerable crops.'
      });
    }
    
    // Wind-based alerts
    if (weather.windSpeed > 20) {
      newAlerts.push({
        id: 'high-wind-' + Date.now(),
        type: 'warning',
        message: `High wind speeds (${weather.windSpeed}km/h). Delay pesticide application.`
      });
    }
    
    return newAlerts;
  };

  const generateWeatherTasks = (weather) => {
    if (!weather) return [];
    
    const tasks = [];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Temperature-based tasks
    if (weather.temperature > 30) {
      tasks.push({
        id: 'water-crops-' + Date.now(),
        date: "Today",
        title: "Increase Irrigation for All Crops",
        description: `High temperature (${weather.temperature}°C) detected`,
        priority: "high"
      });
    }
    
    // Humidity-based tasks
    if (weather.humidity > 80) {
      tasks.push({
        id: 'check-fungal-' + Date.now(),
        date: "Today",
        title: "Check Crops for Fungal Disease",
        description: `High humidity (${weather.humidity}%) increases disease risk`,
        priority: "medium"
      });
    }
    
    // Low humidity task
    if (weather.humidity < 30) {
      tasks.push({
        id: 'water-sensitive-' + Date.now(),
        date: "Today",
        title: "Water Sensitive Crops",
        description: "Low humidity may cause water stress",
        priority: "medium"
      });
    }
    
    // Precipitation-based tasks
    if (weather.precipitation > 5) {
      tasks.push({
        id: 'skip-irrigation-' + Date.now(),
        date: "Today",
        title: "Skip Today's Irrigation",
        description: `Sufficient rainfall (${weather.precipitation}mm) recorded`,
        priority: "low"
      });
    } else if (weather.precipitation < 0.5 && weather.temperature > 25) {
      tasks.push({
        id: 'water-crops-' + Date.now(),
        date: "Today",
        title: "Water Drought-Sensitive Crops",
        description: "Dry conditions detected",
        priority: "high"
      });
    }
    
    // Wind-based tasks
    if (weather.windSpeed > 20) {
      tasks.push({
        id: 'delay-spraying-' + Date.now(),
        date: "Today",
        title: "Delay Pesticide/Fertilizer Application",
        description: `High wind (${weather.windSpeed}km/h) will affect spraying`,
        priority: "high"
      });
    } else if (weather.windSpeed < 10 && weather.precipitation < 1) {
      tasks.push({
        id: 'ideal-spraying-' + Date.now(),
        date: tomorrow,
        title: "Optimal Time for Fertilizer Application",
        description: "Calm winds and dry conditions predicted",
        priority: "medium"
      });
    }
    
    return tasks;
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-b from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}
          </h1>
          <p className="text-gray-600">Here's what's happening on your farm today</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Alerts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Weather Alerts</h2>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-4 rounded-lg ${
                      alert.type === 'info' 
                        ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700' 
                        : alert.type === 'warning'
                        ? 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700'
                        : 'bg-green-50 border-l-4 border-green-500 text-green-700'
                    }`}
                  >
                    {alert.message}
                  </motion.div>
                ))}
                {alerts.length === 0 && !weatherLoading && !weatherError && (
                  <div className="p-4 rounded-lg bg-green-50 border-l-4 border-green-500 text-green-700">
                    No weather alerts for today. Conditions look good for farming activities.
                  </div>
                )}
                {weatherLoading && (
                  <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500 text-blue-700">
                    Loading weather data to generate alerts...
                  </div>
                )}
              </div>
            </motion.div>

            {/* Upcoming Tasks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Tasks</h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-medium text-gray-800">{task.title}</h3>
                          <p className="text-sm text-gray-600">Status: {task.status}</p>
                        </div>
                        <button 
                          onClick={() => markTaskAsDone(task.analysisId, task.type)} 
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Mark as Done
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No upcoming tasks.</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Farm Overview Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Farm Overview</h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-5 h-5 mr-2 text-green-600 flex-shrink-0">
                          <FaMapMarkerAlt className="w-full h-full" />
                        </span>
                        Location
                      </h3>
                      <p className="mt-2 text-gray-600 pl-7">{user?.farmDetails?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-5 h-5 mr-2 text-green-600 flex-shrink-0">
                          <FaLandmark className="w-full h-full" />
                        </span>
                        Farm Size
                      </h3>
                      <p className="mt-2 text-gray-600 pl-7">{user?.farmDetails?.size ? `${user.farmDetails.size} acres` : 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-5 h-5 mr-2 text-green-600 flex-shrink-0">
                          <FaSeedling className="w-full h-full" />
                        </span>
                        Crop Types
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2 pl-7">
                        {user?.farmDetails?.cropTypes?.length > 0 ? (
                          user.farmDetails.cropTypes.map((crop, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {crop}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-600">No crops specified</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-5 h-5 mr-2 text-green-600 flex-shrink-0">
                          <FaMountain className="w-full h-full" />
                        </span>
                        Soil Type
                      </h3>
                      <p className="mt-2 text-gray-600 pl-7">{user?.farmDetails?.soilType || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Calendar Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="w-5 h-5 mr-2 text-green-600" />
                Upcoming Tasks
              </h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  {taskSuggestions.map((task) => (
                    <div key={task.id} className="flex items-start mb-4 last:mb-0">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded font-medium text-sm w-24 text-center">
                        {task.date}
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium text-gray-800">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <div className={`${
                        task.priority === 'high' ? "bg-red-100 text-red-800" : 
                        task.priority === 'medium' ? "bg-yellow-100 text-yellow-800" : 
                        "bg-blue-100 text-blue-800"
                      } px-3 py-1 rounded-full text-xs`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </div>
                    </div>
                  ))}
                  {taskSuggestions.length === 0 && (
                    <p className="text-gray-600 text-center py-4">No weather-based tasks available. Check back after weather data loads.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Weather Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Today's Weather</h2>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => getUserLocation()}
                    className="text-gray-500 hover:text-gray-700 transition"
                    title="Use my location"
                  >
                    <FaMapMarkerAlt className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={fetchWeatherData} 
                    className="text-gray-500 hover:text-gray-700 transition"
                    title="Refresh weather data"
                  >
                    <FaSync className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4 flex items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchWeatherData()}
                    placeholder="Enter location (city, ZIP, coordinates)"
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button 
                    onClick={fetchWeatherData}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaSearch className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {weatherLoading ? (
                <div className="bg-white rounded-2xl p-8 shadow-lg flex justify-center items-center">
                  <motion.div
                    className="w-10 h-10 border-t-4 border-blue-500 border-solid rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              ) : weatherError ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
                  <p>{weatherError}</p>
                  <button 
                    onClick={fetchWeatherData}
                    className="mt-2 text-sm underline"
                  >
                    Try again
                  </button>
                </div>
              ) : currentWeather && (
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl text-white overflow-hidden shadow-lg">
                  <div className="p-4 bg-blue-600/30">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="h-4 w-4 text-blue-100 mr-1" />
                        <span className="text-blue-50 text-sm">{currentWeather.locationName}</span>
                      </div>
                      <div className="text-blue-50 text-xs">
                        Updated: {new Date(currentWeather.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="mr-4">
                        {getWeatherIcon(currentWeather.condition, currentWeather.icon)}
                      </div>
                      <div>
                        <p className="text-4xl font-bold">{currentWeather.temperature}°C</p>
                        <p className="text-blue-100 capitalize">{currentWeather.condition}</p>
                        <p className="text-xs text-blue-100">Feels like: {currentWeather.feelsLike}°C</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <WiHumidity className="inline-block h-6 w-6 text-blue-100 mb-1" />
                        <p className="text-xs text-blue-100">Humidity</p>
                        <p className="text-xl font-semibold">{currentWeather.humidity}%</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-lg">
                        <FaWind className="inline-block h-5 w-5 text-blue-100 mb-1" />
                        <p className="text-xs text-blue-100">Wind</p>
                        <p className="text-xl font-semibold">{currentWeather.windSpeed} km/h</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-lg col-span-2">
                        <BsMoisture className="inline-block h-5 w-5 text-blue-100 mb-1" />
                        <p className="text-xs text-blue-100">Precipitation</p>
                        <p className="text-xl font-semibold">{currentWeather.precipitation} mm</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-white/20 text-center">
                      <Link to="/weather-scheduling" className="text-blue-100 text-sm hover:text-white inline-flex items-center">
                        <FaCalendarAlt className="mr-1 h-3 w-3" />
                        <span>View 5-day forecast</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Quick Actions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <QuickAction 
                  to="/leaf-analysis"
                  icon={<FaLeaf size={20} />}
                  title="Leaf Analysis"
                  description="Analyze crop health with AI"
                  color="bg-green-500"
                  delay={0}
                />
                <QuickAction 
                  to="/smart-irrigation"
                  icon={<FaCloudRain size={20} />}
                  title="Smart Irrigation"
                  description="Optimize water usage"
                  color="bg-blue-500"
                  delay={0.1}
                />
                <QuickAction 
                  to="/weather-scheduling"
                  icon={<FaCloudSun size={20} />}
                  title="Weather Scheduling"
                  description="Plan tasks based on forecasts"
                  color="bg-sky-500"
                  delay={0.2}
                />
                <QuickAction 
                  to="/community"
                  icon={<FaUsers size={20} />}
                  title="Knowledge Community"
                  description="Connect with other farmers"
                  color="bg-indigo-500"
                  delay={0.3}
                />
                <QuickAction 
                  to="/predictive-analysis"
                  icon={<FaChartLine size={20} />}
                  title="Predictive Analysis"
                  description="Forecast yields and prices"
                  color="bg-purple-500"
                  delay={0.4}
                />
                <QuickAction 
                  to="/chatbot"
                  icon={<FaRobot size={20} />}
                  title="Farm Assistant"
                  description="Get instant farming advice"
                  color="bg-emerald-500"
                  delay={0.5}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Action Component
const QuickAction = ({ to, icon, title, description, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 } 
      }}
    >
      <Link 
        to={to}
        className="flex items-center bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      >
        <div className={`${color} p-3 text-white flex-shrink-0`}>
          {icon}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-800 text-sm">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
};

// Custom SVG icons - fixed size for consistency
const FaMapMarkerAlt = ({ className }) => (
  <svg className={className} viewBox="0 0 384 512" fill="currentColor">
    <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" />
  </svg>
);

const FaLandmark = ({ className }) => (
  <svg className={className} viewBox="0 0 512 512" fill="currentColor">
    <path d="M501.62 92.11L267.24 2.04a31.958 31.958 0 0 0-22.47 0L10.38 92.11A16.001 16.001 0 0 0 0 107.09V144c0 8.84 7.16 16 16 16h480c8.84 0 16-7.16 16-16v-36.91c0-6.67-4.14-12.64-10.38-14.98zM64 192v160H48c-8.84 0-16 7.16-16 16v48h448v-48c0-8.84-7.16-16-16-16h-16V192h-64v160h-96V192h-64v160h-96V192H64zm432 256H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h480c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z" />
  </svg>
);

const FaMountain = ({ className }) => (
  <svg className={className} viewBox="0 0 640 512" fill="currentColor">
    <path d="M634.92 462.7l-288-448C341.03 5.54 330.89 0 320 0s-21.03 5.54-26.92 14.7l-288 448a32.001 32.001 0 0 0-1.17 32.64A32.004 32.004 0 0 0 32 512h576c11.71 0 22.48-6.39 28.09-16.67a31.983 31.983 0 0 0-1.17-32.63zM320 91.18L405.39 224H320l-64 64-38.06-38.06L320 91.18z" />
  </svg>
);

export default Dashboard; 
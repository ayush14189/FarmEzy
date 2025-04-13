import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCloudSun, FaCloudRain, FaWind, FaTemperatureHigh, FaCalendarAlt, 
  FaSeedling, FaLeaf, FaClock, FaSync, FaMapMarkerAlt, FaInfoCircle,
  FaCrosshairs
} from 'react-icons/fa';
import { BsCloudDrizzle, BsCloudSnow, BsSun, BsMoisture } from 'react-icons/bs';
import { WiDayLightning, WiDayWindy, WiHumidity } from 'react-icons/wi';
import axios from 'axios';

// Import crop images
import cornImage from '../assets/corn.jpg';
import wheatImage from '../assets/wheat.jpg';
import riceImage from '../assets/rice.jpg';
import soyabeanImage from '../assets/soyabean.jpg';

const WeatherScheduling = ({ user }) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('New Delhi');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    activity: 'irrigation',
    crop: 'corn',
    automatic: true
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    // Try to get user's location when component mounts
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const getUserLocation = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude},${longitude}`);
          setGeoLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGeoLoading(false);
          // Keep the default location if geolocation fails
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setError("Geolocation is not supported by this browser");
      setGeoLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    setLoading(true);
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
      
      // Forecast data (3 days)
      const forecastResponse = await axios.get(`${BASE_URL}/forecast.json`, {
        params: {
          key: API_KEY,
          q: location,
          days: 5,
          aqi: 'no',
          alerts: 'no'
        }
      });

      if (currentResponse.data && forecastResponse.data) {
        // Process current weather
        const current = currentResponse.data.current;
        const locationData = currentResponse.data.location;
        
        console.log('Location Data:', locationData);
        
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
        
        // Process forecast data
        const forecastDays = forecastResponse.data.forecast.forecastday.map(day => {
          return {
            date: day.date,
            day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
            temperature: { 
              min: day.day.mintemp_c, 
              max: day.day.maxtemp_c 
            },
            condition: day.day.condition.text,
            icon: day.day.condition.icon,
            precipitation: day.day.daily_chance_of_rain,
            humidity: day.day.avghumidity,
            windSpeed: day.day.maxwind_kph
          };
        });
        
        setForecast(forecastDays);
        
        // Generate recommendations based on weather data
        generateWeatherBasedTasks(current, forecastDays);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again later.');
      setLoading(false);
    }
  };

  const generateWeatherBasedTasks = (current, forecastDays) => {
    const newTasks = [];
    
    // Check if it's too hot - suggest irrigation
    if (current.temp_c > 30) {
      newTasks.push({
        id: Date.now(),
        title: 'Increase Irrigation for All Crops',
        status: 'upcoming',
        date: new Date().toISOString().split('T')[0],
        activity: 'irrigation',
        crop: 'all',
        automatic: true,
        weather: 'critical'
      });
    }
    
    // Check if it's going to rain tomorrow - suggest postponing irrigation
    const tomorrowForecast = forecastDays[1];
    if (tomorrowForecast && tomorrowForecast.precipitation > 70) {
      newTasks.push({
        id: Date.now() + 1,
        title: 'Postpone Irrigation - Rain Expected',
        status: 'upcoming',
        date: tomorrowForecast.date,
        activity: 'irrigation',
        crop: 'all',
        automatic: true,
        weather: 'optimal'
      });
    }
    
    // Check for high winds - suggest postponing fertilization
    if (current.wind_kph > 25) {
      newTasks.push({
        id: Date.now() + 2,
        title: 'Postpone Fertilization - High Winds',
        status: 'upcoming',
        date: new Date().toISOString().split('T')[0],
        activity: 'fertilization',
        crop: 'all',
        automatic: true,
        weather: 'warning'
      });
    }
    
    // Optimum conditions for planting
    const goodPlantingDay = forecastDays.find(day => 
      day.temperature.max > 18 && 
      day.temperature.max < 28 && 
      day.precipitation < 30 && 
      day.windSpeed < 15
    );
    
    if (goodPlantingDay) {
      newTasks.push({
        id: Date.now() + 3,
        title: 'Optimal Day for Planting',
        status: 'upcoming',
        date: goodPlantingDay.date,
        activity: 'planting',
        crop: 'vegetables',
        automatic: true,
        weather: 'optimal'
      });
    }
    
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    setTasks([...tasks, {
      id: Date.now(),
      title: newTask.title,
      status: 'upcoming',
      date: newTask.date,
      activity: newTask.activity,
      crop: newTask.crop,
      automatic: newTask.automatic,
      weather: 'pending'
    }]);
    
    setNewTask({
      title: '',
      date: new Date().toISOString().split('T')[0],
      activity: 'irrigation',
      crop: 'corn',
      automatic: true
    });
    
    setShowAddTask(false);
  };

  const handleLocationChange = (e) => {
    e.preventDefault();
    fetchWeatherData();
  };

  const getWeatherIcon = (condition, icon) => {
    // If we have an icon URL from the API, use it
    if (icon) {
      return <img src={`https:${icon}`} alt={condition} className="w-12 h-12" />;
    }
    
    // Fallback to our custom icons
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return <BsSun className="text-yellow-500" />;
    } else if (conditionLower.includes('partly cloudy') || conditionLower.includes('cloudy')) {
      return <FaCloudSun className="text-gray-400" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <BsCloudDrizzle className="text-blue-400" />;
    } else if (conditionLower.includes('thunder') || conditionLower.includes('lightning')) {
      return <WiDayLightning className="text-purple-500" />;
    } else if (conditionLower.includes('snow')) {
      return <BsCloudSnow className="text-blue-200" />;
    } else if (conditionLower.includes('wind')) {
      return <WiDayWindy className="text-gray-400" />;
    } else {
      return <FaCloudSun className="text-gray-400" />;
    }
  };

  const getActivityIcon = (activity) => {
    switch(activity) {
      case 'irrigation':
        return <FaCloudRain className="text-blue-500" />;
      case 'fertilization':
        return <FaSeedling className="text-green-600" />;
      case 'planting':
        return <FaLeaf className="text-green-500" />;
      case 'harvesting':
        return <FaSeedling className="text-yellow-600" />;
      default:
        return <FaSeedling className="text-green-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'postponed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWeatherStatusColor = (status) => {
    switch(status) {
      case 'optimal':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-b from-sky-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <FaCloudSun className="text-blue-600 mr-3" />
            Weather-Based Scheduling
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Smart scheduling of farm activities based on real-time weather forecasts and predictions.
          </p>
        </motion.div>

        {/* Location Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="bg-white rounded-2xl shadow-md p-4 mb-6"
        >
          <form onSubmit={handleLocationChange} className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <label htmlFor="location" className="block text-sm text-gray-600 mb-1">Location</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter city, zip code, or coordinates"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="self-end flex space-x-2">
              <button
                type="button"
                onClick={getUserLocation}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
                disabled={geoLoading}
              >
                <FaCrosshairs className="mr-2" /> 
                {geoLoading ? 'Getting Location...' : 'Use My Location'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <FaSync className="mr-2" /> Update Weather
              </button>
            </div>
          </form>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : currentWeather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Weather Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden col-span-1"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-semibold">Current Weather</h2>
                  <button className="text-white/70 hover:text-white" onClick={fetchWeatherData}>
                    <FaSync className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="h-4 w-4 text-white/70" />
                  <span>{currentWeather.locationName}</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="mr-4 text-5xl">
                      {getWeatherIcon(currentWeather.condition, currentWeather.icon)}
                    </div>
                    <div>
                      <div className="text-4xl font-bold">{currentWeather.temperature}°C</div>
                      <div className="text-gray-500 capitalize">{currentWeather.condition}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center text-gray-500 mb-1">
                      <WiHumidity className="mr-1 h-5 w-5" />
                      <span>Humidity</span>
                    </div>
                    <div className="text-xl font-semibold">{currentWeather.humidity}%</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center text-gray-500 mb-1">
                      <FaWind className="mr-1 h-4 w-4" />
                      <span>Wind</span>
                    </div>
                    <div className="text-xl font-semibold">{currentWeather.windSpeed} km/h</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center text-gray-500 mb-1">
                      <BsMoisture className="mr-1 h-4 w-4" />
                      <span>Precipitation</span>
                    </div>
                    <div className="text-xl font-semibold">{currentWeather.precipitation} mm</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center text-gray-500 mb-1">
                      <FaTemperatureHigh className="mr-1 h-4 w-4" />
                      <span>UV Index</span>
                    </div>
                    <div className="text-xl font-semibold">{currentWeather.uvIndex}</div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-500 text-right">
                  Last updated: {currentWeather.lastUpdated}
                </div>
              </div>
            </motion.div>

            {/* Forecast Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden lg:col-span-2"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">5-Day Forecast</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-white/70 hover:text-white flex items-center"
                    >
                      {isExpanded ? 'Simple View' : 'Detailed View'}
                      <FaInfoCircle className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {forecast.map((day, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 min-w-[130px] flex-shrink-0"
                    >
                      <div className="text-center mb-2">
                        <div className="font-medium text-gray-800">{day.day}</div>
                      </div>
                      <div className="flex justify-center mb-2 text-3xl">
                        {getWeatherIcon(day.condition, day.icon)}
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{day.temperature.max}°C</div>
                        <div className="text-gray-500 text-sm">{day.temperature.min}°C</div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Rain</span>
                            <span>{day.precipitation}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span>Humidity</span>
                            <span>{day.humidity}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span>Wind</span>
                            <span>{day.windSpeed} km/h</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FaCalendarAlt className="mr-2 text-indigo-600" />
                      Farm Activity Scheduler
                    </h3>
                    <button 
                      onClick={() => setShowAddTask(!showAddTask)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      {showAddTask ? 'Cancel' : '+ Add Task'}
                    </button>
                  </div>
                  
                  {showAddTask && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-indigo-50 p-4 rounded-xl mb-4"
                    >
                      <h4 className="font-medium text-indigo-800 mb-3">Add New Task</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Task Title</label>
                          <input 
                            type="text" 
                            value={newTask.title}
                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Irrigate Corn Field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Date</label>
                          <input 
                            type="date" 
                            value={newTask.date}
                            onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Activity Type</label>
                          <select 
                            value={newTask.activity}
                            onChange={(e) => setNewTask({...newTask, activity: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="irrigation">Irrigation</option>
                            <option value="fertilization">Fertilization</option>
                            <option value="planting">Planting</option>
                            <option value="harvesting">Harvesting</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Crop Type</label>
                          <select 
                            value={newTask.crop}
                            onChange={(e) => setNewTask({...newTask, crop: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="corn">Corn</option>
                            <option value="wheat">Wheat</option>
                            <option value="rice">Rice</option>
                            <option value="soybean">Soybean</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center mb-4">
                        <input 
                          type="checkbox" 
                          id="automatic" 
                          checked={newTask.automatic}
                          onChange={(e) => setNewTask({...newTask, automatic: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="automatic" className="text-sm text-gray-700">
                          Automatically adjust schedule based on weather conditions
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={handleAddTask}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                          Schedule Task
                        </button>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-3 rounded-full bg-indigo-100 mr-4">
                              {getActivityIcon(task.activity)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{task.title}</h4>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <FaCalendarAlt className="mr-1 h-3 w-3" />
                                <span>{task.date}</span>
                                <span className="mx-1">•</span>
                                <span className="capitalize">{task.crop}</span>
                                {task.automatic && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span className="text-indigo-600 flex items-center">
                                      <FaSync className="mr-1 h-3 w-3" /> Auto-adjust
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs ${getWeatherStatusColor(task.weather)}`}>
                              {task.weather}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Weather Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-white rounded-3xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white">
            <h2 className="text-2xl font-semibold">Crop-Specific Weather Insights</h2>
            <p className="text-white/80">Tailored recommendations based on current weather conditions</p>
          </div>
          
          <div className="p-6">
            {currentWeather && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <img src={cornImage} alt="Corn" className="w-12 h-12 rounded-full mr-3 object-cover" />
                    <h3 className="font-semibold text-lg">Corn</h3>
                  </div>
                  {currentWeather.temperature > 30 ? (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-red-600">too hot</span> for optimal corn growth.</p>
                  ) : currentWeather.temperature > 25 ? (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-green-600">optimal</span> for corn growth.</p>
                  ) : (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-yellow-600">slightly cool</span> for corn growth.</p>
                  )}
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <FaTemperatureHigh className={`mt-1 mr-2 flex-shrink-0 ${
                        currentWeather.temperature > 30 ? "text-red-500" : 
                        currentWeather.temperature > 25 ? "text-green-500" : "text-yellow-500"
                      }`} />
                      <span>Temperature: {currentWeather.temperature}°C {
                        currentWeather.temperature > 30 ? "(too high)" : 
                        currentWeather.temperature > 25 ? "(ideal)" : "(below optimal)"
                      }</span>
                    </li>
                    <li className="flex items-start">
                      <WiHumidity className={`mt-1 mr-2 flex-shrink-0 text-lg ${
                        currentWeather.humidity > 70 ? "text-red-500" : 
                        currentWeather.humidity > 50 ? "text-green-500" : "text-yellow-500"
                      }`} />
                      <span>Humidity: {currentWeather.humidity}% {
                        currentWeather.humidity > 70 ? "(too high)" : 
                        currentWeather.humidity > 50 ? "(ideal)" : "(too low)"
                      }</span>
                    </li>
                    <li className="flex items-start">
                      <FaCloudRain className={`mt-1 mr-2 flex-shrink-0 ${
                        currentWeather.precipitation > 5 ? "text-green-500" : 
                        forecast[0]?.precipitation > 70 ? "text-blue-500" : "text-red-500"
                      }`} />
                      <span>{
                        currentWeather.precipitation > 5 ? "Good precipitation level" : 
                        forecast[0]?.precipitation > 70 ? "Rain expected, delay irrigation" : "Irrigation recommended today"
                      }</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <img src={wheatImage} alt="Wheat" className="w-12 h-12 rounded-full mr-3 object-cover" />
                    <h3 className="font-semibold text-lg">Wheat</h3>
                  </div>
                  {currentWeather.temperature > 28 ? (
                    <p className="text-gray-600 mb-3">Current conditions require <span className="font-medium text-yellow-600">attention</span>.</p>
                  ) : currentWeather.temperature > 20 ? (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-green-600">favorable</span> for wheat.</p>
                  ) : (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-blue-600">too cool</span> for wheat.</p>
                  )}
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <FaTemperatureHigh className={`mt-1 mr-2 flex-shrink-0 ${
                        currentWeather.temperature > 28 ? "text-orange-500" : 
                        currentWeather.temperature > 20 ? "text-green-500" : "text-blue-500"
                      }`} />
                      <span>Temperature: {currentWeather.temperature}°C {
                        currentWeather.temperature > 28 ? "(slightly high)" : 
                        currentWeather.temperature > 20 ? "(ideal)" : "(too low)"
                      }</span>
                    </li>
                    <li className="flex items-start">
                      <WiHumidity className={`mt-1 mr-2 flex-shrink-0 text-lg ${
                        currentWeather.humidity > 75 ? "text-red-500" : 
                        currentWeather.humidity > 55 ? "text-green-500" : "text-yellow-500"
                      }`} />
                      <span>Humidity: {currentWeather.humidity}% {
                        currentWeather.humidity > 75 ? "(too high, risk of disease)" : 
                        currentWeather.humidity > 55 ? "(good range)" : "(too low)"
                      }</span>
                    </li>
                    <li className="flex items-start">
                      <FaCloudRain className={`mt-1 mr-2 flex-shrink-0 ${
                        currentWeather.precipitation > 3 ? "text-green-500" : 
                        forecast[0]?.precipitation > 50 ? "text-blue-500" : "text-red-500"
                      }`} />
                      <span>{
                        currentWeather.precipitation > 3 ? "Adequate moisture" : 
                        forecast[0]?.precipitation > 50 ? "Rain expected soon" : "Irrigation needed"
                      }</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <img src={riceImage} alt="Rice" className="w-12 h-12 rounded-full mr-3 object-cover" />
                    <h3 className="font-semibold text-lg">Rice</h3>
                  </div>
                  {currentWeather.temperature > 32 ? (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-red-600">too hot</span> for rice.</p>
                  ) : currentWeather.temperature > 24 ? (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-green-600">good</span> for rice.</p>
                  ) : (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-yellow-600">too cool</span> for rice.</p>
                  )}
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <FaTemperatureHigh className={`mt-1 mr-2 flex-shrink-0 ${
                        currentWeather.temperature > 32 ? "text-red-500" : 
                        currentWeather.temperature > 24 ? "text-green-500" : "text-blue-500"
                      }`} />
                      <span>Temperature: {currentWeather.temperature}°C {
                        currentWeather.temperature > 32 ? "(too high)" : 
                        currentWeather.temperature > 24 ? "(ideal)" : "(too low)"
                      }</span>
                    </li>
                    <li className="flex items-start">
                      <WiHumidity className={`mt-1 mr-2 flex-shrink-0 text-lg ${
                        currentWeather.humidity > 80 ? "text-green-500" : "text-yellow-500"
                      }`} />
                      <span>Humidity: {currentWeather.humidity}% {
                        currentWeather.humidity > 80 ? "(ideal for rice)" : "(slightly low for rice)"
                      }</span>
                    </li>
                    <li className="flex items-start">
                      <FaCloudRain className={`mt-1 mr-2 flex-shrink-0 ${
                        currentWeather.precipitation > 0 ? "text-green-500" : "text-yellow-500"
                      }`} />
                      <span>{
                        currentWeather.precipitation > 0 ? "Natural water intake today" : "Check water levels in paddy"
                      }</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <img src={soyabeanImage} alt="Soybean" className="w-12 h-12 rounded-full mr-3 object-cover" />
                    <h3 className="font-semibold text-lg">Soybean</h3>
                  </div>
                  {currentWeather.temperature > 30 ? (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-yellow-600">too warm</span> for soybeans.</p>
                  ) : currentWeather.temperature > 22 ? (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-green-600">ideal</span> for soybeans.</p>
                  ) : (
                    <p className="text-gray-600 mb-3">Current conditions are <span className="font-medium text-blue-600">too cool</span> for soybeans.</p>
                  )}
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <FaTemperatureHigh className={`mt-1 mr-2 flex-shrink-0 ${
                        currentWeather.temperature > 30 ? "text-yellow-500" : 
                        currentWeather.temperature > 22 ? "text-green-500" : "text-blue-500"
                      }`} />
                      <span>Temperature: {currentWeather.temperature}°C {
                        currentWeather.temperature > 30 ? "(high)" : 
                        currentWeather.temperature > 22 ? "(optimal)" : "(too cool)"
                      }</span>
                    </li>
                    <li className="flex items-start">
                      <WiHumidity className={`mt-1 mr-2 flex-shrink-0 text-lg ${
                        currentWeather.humidity < 50 ? "text-yellow-500" : 
                        currentWeather.humidity > 80 ? "text-red-500" : "text-green-500"
                      }`} />
                      <span>Humidity: {currentWeather.humidity}% {
                        currentWeather.humidity < 50 ? "(too low)" : 
                        currentWeather.humidity > 80 ? "(too high, disease risk)" : "(good range)"
                      }</span>
                    </li>
                    <li className="flex items-start">
                      <FaCloudRain className={`mt-1 mr-2 flex-shrink-0 ${
                        currentWeather.precipitation > 2 ? "text-green-500" : 
                        forecast[0]?.precipitation > 60 ? "text-blue-500" : "text-red-500"
                      }`} />
                      <span>{
                        currentWeather.precipitation > 2 ? "Good moisture level" : 
                        forecast[0]?.precipitation > 60 ? "Rain coming, hold irrigation" : "Irrigation recommended"
                      }</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WeatherScheduling;
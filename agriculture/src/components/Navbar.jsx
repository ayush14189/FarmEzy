import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaUser, FaBars, FaTimes, FaSignOutAlt, FaCloudSun, FaUsers, FaMicroscope, FaWater, FaChartLine, FaRobot, FaHome } from 'react-icons/fa';

const Navbar = ({ isAuthenticated, user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Array of navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Leaf Analysis', path: '/leaf-analysis' },
    { name: 'Smart Irrigation', path: '/smart-irrigation' },
    { name: 'Weather Planning', path: '/weather-scheduling' },
    { name: 'Community', path: '/community' },
    { name: 'Chatbot', path: '/chatbot' },
  ];
  
  // For dashboard and other authenticated routes, always show solid background
  const isDashboardOrAuth = isAuthenticated || 
    location.pathname.includes('/dashboard') || 
    location.pathname.includes('/leaf-analysis') ||
    location.pathname.includes('/smart-irrigation') ||
    location.pathname.includes('/predictive-analysis') ||
    location.pathname.includes('/chatbot') ||
    location.pathname.includes('/weather-scheduling') ||
    location.pathname.includes('/community');

  // Handle scroll event to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled || isDashboardOrAuth 
          ? 'bg-white shadow-lg py-2' 
          : 'bg-black/30 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                times: [0, 0.25, 0.75, 1]
              }}
            >
              <FaLeaf className="text-green-500 text-3xl" />
            </motion.div>
            <motion.span 
              className={`text-xl md:text-2xl font-bold ${
                scrolled || isDashboardOrAuth ? 'text-green-600' : 'text-white'
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              AgriVision
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" scrolled={scrolled} isDashboardOrAuth={isDashboardOrAuth}>
                  <FaChartLine className="mr-1 inline-block" />Dashboard
                </NavLink>
                <NavLink to="/leaf-analysis" scrolled={scrolled} isDashboardOrAuth={isDashboardOrAuth}>
                  <FaMicroscope className="mr-1 inline-block" />Leaf Analysis
                </NavLink>
                <NavLink to="/smart-irrigation" scrolled={scrolled} isDashboardOrAuth={isDashboardOrAuth}>
                  <FaWater className="mr-1 inline-block" />Irrigation
                </NavLink>
                <NavLink to="/weather-scheduling" scrolled={scrolled} isDashboardOrAuth={isDashboardOrAuth}>
                  <FaCloudSun className="mr-1 inline-block" />Weather
                </NavLink>
                <NavLink to="/community" scrolled={scrolled} isDashboardOrAuth={isDashboardOrAuth}>
                  <FaUsers className="mr-1 inline-block" />Community
                </NavLink>
                <NavLink to="/predictive-analysis" scrolled={scrolled} isDashboardOrAuth={isDashboardOrAuth}>
                  <FaChartLine className="mr-1 inline-block" />Analytics
                </NavLink>
                <NavLink to="/chatbot" scrolled={scrolled} isDashboardOrAuth={isDashboardOrAuth}>
                  <FaRobot className="mr-1 inline-block" />Assistant
                </NavLink>
                
                <div className="relative group ml-4">
                  <button className="flex items-center space-x-1 focus:outline-none">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 border-2 border-green-500">
                      {user?.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <span className={isDashboardOrAuth || scrolled ? 'text-gray-800' : 'text-white'}>
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center space-x-2"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <Link 
                    to="/login" 
                    className={`px-4 py-2 rounded-full ${
                      scrolled 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-white hover:bg-white/20'
                    } transition-colors`}
                  >
                    Login
                  </Link>
                )}
                {location.pathname !== '/register' && (
                  <Link 
                    to="/register" 
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    Sign Up
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="lg:hidden text-green-500 p-2 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div 
        className="lg:hidden"
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        <div className="px-4 py-3 bg-white shadow-inner">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3 p-2 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 border-2 border-green-500">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <Link to="/dashboard" className="p-2 text-gray-700 hover:bg-green-50 rounded-md flex items-center">
                <FaChartLine className="mr-2" /> Dashboard
              </Link>
              <Link to="/leaf-analysis" className="p-2 text-gray-700 hover:bg-green-50 rounded-md flex items-center">
                <FaMicroscope className="mr-2" /> Leaf Analysis
              </Link>
              <Link to="/smart-irrigation" className="p-2 text-gray-700 hover:bg-green-50 rounded-md flex items-center">
                <FaWater className="mr-2" /> Smart Irrigation
              </Link>
              <Link to="/weather-scheduling" className="p-2 text-gray-700 hover:bg-green-50 rounded-md flex items-center">
                <FaCloudSun className="mr-2" /> Weather Scheduling
              </Link>
              <Link to="/community" className="p-2 text-gray-700 hover:bg-green-50 rounded-md flex items-center">
                <FaUsers className="mr-2" /> Community
              </Link>
              <Link to="/predictive-analysis" className="p-2 text-gray-700 hover:bg-green-50 rounded-md flex items-center">
                <FaChartLine className="mr-2" /> Predictive Analysis
              </Link>
              <Link to="/chatbot" className="p-2 text-gray-700 hover:bg-green-50 rounded-md flex items-center">
                <FaRobot className="mr-2" /> Farm Assistant
              </Link>
              
              <button 
                onClick={logout}
                className="mt-4 p-2 text-left text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <Link 
                to="/login" 
                className="w-full py-2 text-center text-green-600 hover:bg-green-50 rounded-md"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="w-full py-2 text-center bg-green-600 text-white hover:bg-green-700 rounded-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

// NavLink component
const NavLink = ({ to, children, scrolled, isDashboardOrAuth }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to}
      className={`px-3 py-2 rounded-full transition-colors ${
        isActive 
          ? 'bg-green-50 text-green-600' 
          : scrolled || isDashboardOrAuth 
            ? 'text-gray-700 hover:bg-gray-100' 
            : 'text-white hover:bg-white/20'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar; 
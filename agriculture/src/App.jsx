import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// Import CSS
import './App.css'

// Import pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import LeafAnalysis from './pages/LeafAnalysis'
import SmartIrrigation from './pages/SmartIrrigation'
import PredictiveAnalysis from './pages/PredictiveAnalysis'
import Chatbot from './pages/Chatbot'
import NotFound from './pages/NotFound'
import WeatherScheduling from './pages/WeatherScheduling'
import Community from './pages/Community'

// Import components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import ScrollToTop from './components/ScrollToTop'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
    
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          className="w-16 h-16 border-t-4 border-green-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
        <Navbar isAuthenticated={isAuthenticated} user={user} logout={logout} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login login={login} />
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Register login={login} />
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard user={user} />
              </PrivateRoute>
            } />
            <Route path="/leaf-analysis" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <LeafAnalysis user={user} />
              </PrivateRoute>
            } />
            <Route path="/smart-irrigation" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <SmartIrrigation user={user} />
              </PrivateRoute>
            } />
            <Route path="/predictive-analysis" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <PredictiveAnalysis user={user} />
              </PrivateRoute>
            } />
            <Route path="/chatbot" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Chatbot user={user} />
              </PrivateRoute>
            } />
            <Route path="/weather-scheduling" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <WeatherScheduling user={user} />
              </PrivateRoute>
            } />
            <Route path="/community" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Community user={user} />
              </PrivateRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App

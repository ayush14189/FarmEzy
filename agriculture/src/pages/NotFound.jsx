import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaSeedling } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-green-50 to-blue-50 relative overflow-hidden">
      {/* Floating leaves background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute text-green-300 opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 3 + 1}rem`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() > 0.5 ? 10 : -10, 0],
              rotate: [0, Math.random() > 0.5 ? 10 : -10, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            {index % 2 === 0 ? <FaLeaf /> : <FaSeedling />}
          </motion.div>
        ))}
      </div>

      <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="text-green-300 text-[150px] opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <FaSeedling />
              </motion.div>
              <h1 className="text-8xl font-bold text-green-700">404</h1>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Oops! Crop not found.</h2>
          <p className="text-gray-600 mb-8">
            It seems like the page you're looking for has been harvested or doesn't exist.
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 font-medium"
          >
            <FaLeaf className="mr-2" />
            Return to Home Field
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 
import { FaLeaf, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <footer className="bg-green-800 text-white pt-12 pb-6 relative overflow-hidden">
      {/* Decorative plant silhouettes */}
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M20,180 Q60,120 20,60 Q80,100 140,60 Q100,120 140,180 Q80,140 20,180 Z" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M100,20 Q140,80 180,40 Q120,100 180,160 Q140,120 100,180 Q60,120 20,160 Q80,100 20,40 Q60,80 100,20 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Company Info */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center mb-4">
              <FaLeaf className="text-green-400 text-2xl mr-2" />
              <h3 className="text-xl font-bold">AI Smart Farming</h3>
            </div>
            <p className="text-green-100 mb-4">
              Revolutionizing agriculture with AI-powered solutions for sustainable and efficient farming.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-green-200 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-green-200 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-green-200 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-green-200 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 border-b border-green-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-green-200 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="text-green-200 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/leaf-analysis" className="text-green-200 hover:text-white transition-colors">Leaf Analysis</Link></li>
              <li><Link to="/smart-irrigation" className="text-green-200 hover:text-white transition-colors">Smart Irrigation</Link></li>
              <li><Link to="/weather-scheduling" className="text-green-200 hover:text-white transition-colors">Weather Forecasting</Link></li>
            </ul>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 border-b border-green-700 pb-2">Features</h3>
            <ul className="space-y-2">
              <li><Link to="/predictive-analysis" className="text-green-200 hover:text-white transition-colors">Yield Prediction</Link></li>
              <li><Link to="/chatbot" className="text-green-200 hover:text-white transition-colors">Farm Assistant</Link></li>
              <li><Link to="/community" className="text-green-200 hover:text-white transition-colors">Community Forum</Link></li>
              <li><a href="#" className="text-green-200 hover:text-white transition-colors">Knowledge Base</a></li>
              <li><a href="#" className="text-green-200 hover:text-white transition-colors">Market Insights</a></li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 border-b border-green-700 pb-2">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-green-200 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-green-200 hover:text-white transition-colors">Farming Guide</a></li>
              <li><a href="#" className="text-green-200 hover:text-white transition-colors">Research Papers</a></li>
              <li><a href="#" className="text-green-200 hover:text-white transition-colors">Weather Maps</a></li>
              <li><a href="#" className="text-green-200 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 border-b border-green-700 pb-2">Contact Us</h3>
            <address className="not-italic space-y-2 text-green-200">
              <p>123 Farm Road,</p>
              <p>Agritech Valley, CA 94085</p>
              <p className="mt-4">info@aismartfarming.com</p>
              <p>+1 (555) 123-4567</p>
            </address>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-green-700 text-center text-green-300 text-sm">
          <p>© {currentYear} AI Smart Farming. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
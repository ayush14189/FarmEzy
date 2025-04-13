import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStore, FaLeaf, FaSearch, FaFilter, FaStar, FaShoppingCart, FaHeart, FaMapMarkerAlt } from 'react-icons/fa';

const Marketplace = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Organic Tomatoes',
          price: 3.99,
          unit: 'kg',
          farmer: 'Green Valley Farm',
          location: 'Albany, NY',
          rating: 4.8,
          reviews: 24,
          image: 'https://via.placeholder.com/150',
          category: 'vegetables',
          inStock: true,
          description: 'Fresh organic tomatoes grown without pesticides',
          distance: '12km away'
        },
        {
          id: 2,
          name: 'Fresh Corn',
          price: 1.49,
          unit: 'piece',
          farmer: 'Sunshine Acres',
          location: 'Buffalo, NY',
          rating: 4.5,
          reviews: 18,
          image: 'https://via.placeholder.com/150',
          category: 'vegetables',
          inStock: true,
          description: 'Sweet corn harvested this week',
          distance: '8km away'
        },
        {
          id: 3,
          name: 'Organic Apples',
          price: 2.99,
          unit: 'kg',
          farmer: 'Hillside Orchard',
          location: 'Rochester, NY',
          rating: 4.9,
          reviews: 36,
          image: 'https://via.placeholder.com/150',
          category: 'fruits',
          inStock: true,
          description: 'Crisp and sweet organic apples',
          distance: '15km away'
        },
        {
          id: 4,
          name: 'Free-Range Eggs',
          price: 5.49,
          unit: 'dozen',
          farmer: 'Happy Hen Farm',
          location: 'Syracuse, NY',
          rating: 4.7,
          reviews: 29,
          image: 'https://via.placeholder.com/150',
          category: 'dairy',
          inStock: true,
          description: 'Eggs from free-range, happy chickens',
          distance: '20km away'
        },
        {
          id: 5,
          name: 'Raw Honey',
          price: 7.99,
          unit: 'jar',
          farmer: 'Bee Haven Apiaries',
          location: 'Ithaca, NY',
          rating: 5.0,
          reviews: 42,
          image: 'https://via.placeholder.com/150',
          category: 'other',
          inStock: true,
          description: 'Pure, unfiltered honey from local bees',
          distance: '18km away'
        },
        {
          id: 6,
          name: 'Fresh Basil',
          price: 1.99,
          unit: 'bunch',
          farmer: 'Herbal Essentials',
          location: 'Albany, NY',
          rating: 4.6,
          reviews: 15,
          image: 'https://via.placeholder.com/150',
          category: 'herbs',
          inStock: true,
          description: 'Aromatic basil, perfect for cooking',
          distance: '5km away'
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'dairy', name: 'Dairy & Eggs' },
    { id: 'herbs', name: 'Herbs' },
    { id: 'other', name: 'Other' }
  ];

  const addToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.farmer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <FaStore className="text-amber-600 mr-3" />
            Farmers' Marketplace
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Support local agriculture by buying directly from farmers in your area.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Search products or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  className="pl-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <button className="relative py-3 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
                <span className="flex items-center justify-center">
                  <FaShoppingCart className="mr-2" />
                  Cart ({cart.length})
                </span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              className="w-16 h-16 border-t-4 border-amber-500 border-solid rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * product.id }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white"
                  >
                    <FaHeart className={favorites.includes(product.id) ? "text-red-500" : "text-gray-400"} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <span className="text-white flex items-center text-sm">
                      <FaMapMarkerAlt className="mr-1" /> {product.distance}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <div className="flex items-center">
                      <FaStar className="text-amber-400 mr-1" />
                      <span className="text-gray-700">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>by {product.farmer}</span>
                    <span className="mx-2">•</span>
                    <span>{product.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-gray-800">${product.price}</span>
                      <span className="text-gray-600 text-sm ml-1">/ {product.unit}</span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center"
                    >
                      <FaShoppingCart className="mr-2" />
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Featured Farmers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <h2 className="text-2xl font-semibold">Featured Local Farmers</h2>
            <p className="text-white/80">Connect directly with these trusted producers</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-center mb-3">
                  <img src="https://via.placeholder.com/50" alt="Farmer" className="rounded-full mr-3" />
                  <div>
                    <h3 className="font-semibold">Green Valley Farm</h3>
                    <p className="text-sm text-gray-500">Albany, NY</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">Specializing in organic vegetables for over 15 years.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaStar className="text-amber-400" />
                    <span className="ml-1 text-gray-700">4.8 (24 reviews)</span>
                  </div>
                  <button className="text-amber-600 font-medium hover:text-amber-700">
                    View Products
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-center mb-3">
                  <img src="https://via.placeholder.com/50" alt="Farmer" className="rounded-full mr-3" />
                  <div>
                    <h3 className="font-semibold">Hillside Orchard</h3>
                    <p className="text-sm text-gray-500">Rochester, NY</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">Family-owned apple orchard with sustainable practices.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaStar className="text-amber-400" />
                    <span className="ml-1 text-gray-700">4.9 (36 reviews)</span>
                  </div>
                  <button className="text-amber-600 font-medium hover:text-amber-700">
                    View Products
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-center mb-3">
                  <img src="https://via.placeholder.com/50" alt="Farmer" className="rounded-full mr-3" />
                  <div>
                    <h3 className="font-semibold">Happy Hen Farm</h3>
                    <p className="text-sm text-gray-500">Syracuse, NY</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">Ethical poultry farm with free-range eggs and dairy.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaStar className="text-amber-400" />
                    <span className="ml-1 text-gray-700">4.7 (29 reviews)</span>
                  </div>
                  <button className="text-amber-600 font-medium hover:text-amber-700">
                    View Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Marketplace;
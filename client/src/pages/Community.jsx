import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaComment, FaThumbsUp, FaShare, FaBookmark, FaSearch, FaFilter, FaUserCircle, FaLink } from 'react-icons/fa';
import axios from 'axios';

const Community = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostLink, setNewPostLink] = useState('');
  const [newPostLinkDesc, setNewPostLinkDesc] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [error, setError] = useState(null);

  // Fetch posts from API
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/community/posts?';
      
      if (selectedCategory !== 'all') {
        url += `category=${selectedCategory}&`;
      }
      
      if (searchTerm) {
        url += `search=${searchTerm}&`;
      }
      
      const response = await axios.get(url);
      setPosts(response.data.data.posts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'pest-control', name: 'Pest Control' },
    { id: 'soil-health', name: 'Soil Health' },
    { id: 'irrigation', name: 'Irrigation' },
    { id: 'crops', name: 'Crop Management' },
    { id: 'equipment', name: 'Equipment & Tools' },
    { id: 'general', name: 'General' }
  ];

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/community/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the post in the state
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
      setError('Failed to like post. Please try again.');
    }
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !newPostTitle.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const links = [];
      if (newPostLink.trim()) {
        links.push({
          url: newPostLink,
          description: newPostLinkDesc || 'Related link'
        });
      }
      
      const response = await axios.post('http://localhost:5000/api/community/posts', {
        title: newPostTitle,
        content: newPostContent,
        category: selectedCategory !== 'all' ? selectedCategory : 'general',
        links
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add the new post to the state
      setPosts([response.data.data, ...posts]);
      
      // Reset form
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostLink('');
      setNewPostLinkDesc('');
      setShowNewPostForm(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-b from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <FaUsers className="text-indigo-600 mr-3" />
            Farmer Knowledge Community
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Connect with other farmers, share experiences and learn from the community.
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
                className="w-full pl-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search posts, topics, or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="flex items-center">
                  <FaFilter className="text-gray-400 mr-2" />
                  <select
                    className="py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                className="py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {showNewPostForm ? 'Cancel' : 'New Post'}
              </button>
            </div>
          </div>

          {showNewPostForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border border-gray-200 rounded-xl p-4"
            >
              <h3 className="font-medium text-gray-800 mb-3">Start a New Discussion</h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter a descriptive title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Content</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
                  placeholder="Share your farming knowledge, ask questions, or discuss challenges..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Add Link (Optional)</label>
                <input
                  type="url"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                  placeholder="https://example.com"
                  value={newPostLink}
                  onChange={(e) => setNewPostLink(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Link description (optional)"
                  value={newPostLinkDesc}
                  onChange={(e) => setNewPostLinkDesc(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between mt-3">
                <div className="flex items-center">
                  <select
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={selectedCategory !== 'all' ? selectedCategory : 'general'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleSubmitPost}
                  disabled={!newPostContent.trim() || !newPostTitle.trim()}
                  className={`px-4 py-2 rounded-lg transition ${
                    newPostContent.trim() && newPostTitle.trim()
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Post
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Posts Section */}
        <div className="space-y-6 mb-12">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div
                className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : (
            posts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                <FaUsers className="text-indigo-400 text-5xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Be the first to start a discussion in this community!'}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start">
                      <FaUserCircle className="text-gray-400 w-10 h-10 mr-4" />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">{post.author.name}</h3>
                            <p className="text-sm text-gray-500">
                              {post.author.farm} · {post.author.location} · {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                              {categories.find(c => c.id === post.category)?.name || post.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <h4 className="text-lg font-medium text-gray-800 mb-2">{post.title}</h4>
                          <p className="text-gray-700">{post.content}</p>
                          
                          {post.links && post.links.length > 0 && (
                            <div className="mt-3">
                              {post.links.map((link, index) => (
                                <a 
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center mt-2 text-indigo-600 hover:text-indigo-800"
                                >
                                  <FaLink className="mr-2" />
                                  <span>{link.description || link.url}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
                          <button 
                            onClick={() => handleLike(post._id)}
                            className="flex items-center text-gray-600 hover:text-indigo-600"
                          >
                            <FaThumbsUp className="mr-1" />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center text-gray-600 hover:text-indigo-600">
                            <FaComment className="mr-1" />
                            <span>{post.comments ? post.comments.length : 0}</span>
                          </button>
                          <button className="flex items-center text-gray-600 hover:text-indigo-600">
                            <FaShare className="mr-1" />
                            <span>Share</span>
                          </button>
                          <button className="flex items-center text-gray-600 hover:text-indigo-600 ml-auto">
                            <FaBookmark className="mr-1" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )
          )}
        </div>

        {/* Expert Farmers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-semibold">Expert Farmers & Mentors</h2>
            <p className="text-white/80">Connect with experienced farmers who share knowledge</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-center mb-3">
                  <FaUserCircle className="text-gray-400 w-10 h-10 mr-3" />
                  <div>
                    <h3 className="font-semibold">Dr. James Wilson</h3>
                    <p className="text-sm text-gray-500">Soil Science Expert</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">30+ years experience in soil regeneration and no-till farming methods.</p>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-medium">125 contributions</span>
                  <button className="text-indigo-600 font-medium hover:text-indigo-700">
                    Follow
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-center mb-3">
                  <FaUserCircle className="text-gray-400 w-10 h-10 mr-3" />
                  <div>
                    <h3 className="font-semibold">Emily Parker</h3>
                    <p className="text-sm text-gray-500">Organic Certification Specialist</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">Guides farmers through organic certification process, specializing in small farms.</p>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-medium">87 contributions</span>
                  <button className="text-indigo-600 font-medium hover:text-indigo-700">
                    Follow
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-center mb-3">
                  <FaUserCircle className="text-gray-400 w-10 h-10 mr-3" />
                  <div>
                    <h3 className="font-semibold">Michael Torres</h3>
                    <p className="text-sm text-gray-500">Irrigation Systems Designer</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">Specializes in water-efficient irrigation systems for various climate zones.</p>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-medium">104 contributions</span>
                  <button className="text-indigo-600 font-medium hover:text-indigo-700">
                    Follow
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

export default Community;
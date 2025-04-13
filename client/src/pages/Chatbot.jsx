import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaUser, FaPaperPlane, FaSeedling, FaLeaf, FaCloudRain, FaBug, FaTractor, FaSun, FaWater } from 'react-icons/fa';

const Chatbot = ({ user }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: 'Hello! I\'m your AgriAssistant. I can help with crop management, pest control, irrigation advice, and more. What farming questions do you have today?',
      timestamp: new Date()
    }
  ]);

  // Enhanced auto-scroll logic that works during streaming
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  // Scroll on chat history update
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  // Set up an interval to check for scroll during streaming responses
  useEffect(() => {
    let scrollInterval;
    
    if (isLoading) {
      // During loading/streaming, check scroll position more frequently
      scrollInterval = setInterval(scrollToBottom, 300);
    }
    
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [isLoading]);

  // Sample suggested questions
  const suggestedQuestions = [
    "How often should I water tomato plants?",
    "What are natural ways to control aphids?",
    "Best fertilizer for corn crops?",
    "How to improve soil fertility naturally?",
    "When is the best time to plant wheat?",
    "Signs of nitrogen deficiency in plants?"
  ];

  const formatMessage = (text) => {
    // Check if the message contains numbered steps or bullet points
    if (text.includes('*') || text.match(/^\d+\./m)) {
      return (
        <div className="space-y-3 text-left">
          {text.split('\n').map((line, index) => {
            // Handle numbered steps
            if (line.match(/^\d+\./)) {
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">
                    {line.match(/^\d+/)[0]}
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-800">{line.replace(/^\d+\.\s*/, '')}</p>
                  </div>
                </div>
              );
            }
            // Handle bullet points
            else if (line.startsWith('*')) {
              const cleanText = line.replace(/^\*\s*/, '');
              if (cleanText.startsWith('Resources:')) {
                return (
                  <div key={index} className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400">
                    <p className="text-blue-800 font-medium">{cleanText}</p>
                  </div>
                );
              }
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    •
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-800">{cleanText}</p>
                  </div>
                </div>
              );
            }
            // Handle empty lines
            else if (!line.trim()) {
              return <div key={index} className="h-2" />;
            }
            // Regular text
            return <p key={index} className="text-gray-800">{line}</p>;
          })}
        </div>
      );
    }
    return <p className="text-gray-800 text-left">{text}</p>;
  };

  const generateResponse = async (userMessage) => {
    setError(null);
    try {
      console.log("Sending request to Ollama API...");
      const API_URL = 'http://localhost:11434/api/generate';
      
      // Create a placeholder for the streaming response
      const botMessage = {
        sender: 'bot',
        text: '',
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, botMessage]);
      // Force an immediate scroll after adding the bot message placeholder
      setTimeout(scrollToBottom, 50);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gemma3:4b",
          prompt: `You are an agricultural assistant named AgriAssistant, specializing in farming advice.

Instructions:
1. If the user's question is in Hinglish (Hindi-English mix), respond in Hindi
2. If the user's question is in English, respond in English
3. Keep answers concise, practical and farmer-friendly
4. Include specific actionable advice when possible

User's farming question:${userMessage}`,
          stream: true
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status}`, errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Split the chunk by newlines and parse each line as JSON
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                fullText += data.response;
                
                // Update the bot message in real-time
                setChatHistory(prev => {
                  const newHistory = [...prev];
                  newHistory[newHistory.length - 1] = {
                    ...newHistory[newHistory.length - 1],
                    text: fullText
                  };
                  return newHistory;
                });
                
                // Trigger a scroll update immediately after updating the message
                setTimeout(scrollToBottom, 10);
              }
            } catch (e) {
              console.warn('Error parsing JSON line:', e, line);
            }
          }
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        throw streamError;
      }
      
      // One final scroll to make sure we're at the bottom
      setTimeout(scrollToBottom, 100);
      return fullText;
      
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      setError(error.message);
      
      // Update the bot message with an error text
      setChatHistory(prev => {
        const newHistory = [...prev];
        if (newHistory[newHistory.length - 1].sender === 'bot' && newHistory[newHistory.length - 1].text === '') {
          newHistory[newHistory.length - 1].text = "I apologize, but I'm having trouble accessing my knowledge base right now. Please try again in a moment.";
        }
        return newHistory;
      });
      
      return "I apologize, but I'm having trouble accessing my knowledge base right now. Please try again in a moment.";
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      sender: 'user',
      text: message,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Get the response from the API - the function now handles adding the bot's message
      await generateResponse(message);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      // Skip adding error message here as it's already handled in generateResponse
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggestedQuestion = (question) => {
    setMessage(question);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-b from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <FaRobot className="text-emerald-600 mr-3" />
            Farm Assistant
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Get instant answers to your farming questions through our AI-powered assistant.
          </p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-lg text-sm">
              Error: {error}. Please check that Ollama is running with the gemma3:4b model loaded.
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden lg:col-span-3"
          >
            {/* Chat Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 mr-3">
                <FaRobot size={20} />
              </div>
              <div>
                <h2 className="font-bold">AgriAssistant</h2>
                <p className="text-xs text-emerald-100">Your smart farming companion</p>
              </div>
              <div className="ml-auto flex space-x-2">
                <span className="inline-block px-2 py-1 bg-emerald-700 rounded-full text-xs">Beta</span>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="p-4 h-[60vh] overflow-y-auto flex flex-col space-y-4" 
              id="chat-messages"
            >
              {chatHistory.map((chat, index) => (
                <div 
                  key={index} 
                  className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      chat.sender === 'user' 
                        ? 'bg-emerald-100 text-gray-800 rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start mb-1">
                      {chat.sender === 'bot' && (
                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white mr-2">
                          <FaRobot size={12} />
                        </div>
                      )}
                      {chat.sender === 'user' && (
                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white ml-2 order-2">
                          <FaUser size={12} />
                        </div>
                      )}
                      <div className={chat.sender === 'user' ? 'order-1 mr-2' : ''}>
                        {formatMessage(chat.text)}
                      </div>
                    </div>
                    <p className={`text-xs text-gray-500 ${chat.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                        <FaRobot size={12} />
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-[1px]" /> {/* Enhanced invisible element */}
            </div>
            
            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about farming..."
                  className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button 
                  type="submit"
                  className="bg-emerald-600 text-white p-3 rounded-r-lg hover:bg-emerald-700 transition"
                  disabled={isLoading}
                >
                  <FaPaperPlane />
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                *This interface requires Ollama running with the gemma3:4b model loaded.
              </p>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Suggested Questions */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Suggested Questions</h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestedQuestion(question)}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-emerald-50 rounded-lg transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Categories */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button className="w-full flex items-center p-2 text-sm text-left bg-gray-50 hover:bg-emerald-50 rounded-lg transition">
                    <FaSeedling className="text-emerald-600 mr-2" /> 
                    <span>Crop Management</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center p-2 text-sm text-left bg-gray-50 hover:bg-emerald-50 rounded-lg transition">
                    <FaBug className="text-emerald-600 mr-2" /> 
                    <span>Pest Control</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center p-2 text-sm text-left bg-gray-50 hover:bg-emerald-50 rounded-lg transition">
                    <FaWater className="text-emerald-600 mr-2" /> 
                    <span>Irrigation</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center p-2 text-sm text-left bg-gray-50 hover:bg-emerald-50 rounded-lg transition">
                    <FaLeaf className="text-emerald-600 mr-2" /> 
                    <span>Plant Health</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center p-2 text-sm text-left bg-gray-50 hover:bg-emerald-50 rounded-lg transition">
                    <FaTractor className="text-emerald-600 mr-2" /> 
                    <span>Farm Equipment</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center p-2 text-sm text-left bg-gray-50 hover:bg-emerald-50 rounded-lg transition">
                    <FaSun className="text-emerald-600 mr-2" /> 
                    <span>Weather Impact</span>
                  </button>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 
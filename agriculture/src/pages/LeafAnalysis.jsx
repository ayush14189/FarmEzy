import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaUpload, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const LeafAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://localhost:5050/predict/leaf-disease', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Leaf Disease Analysis</h1>
          <p className="text-lg text-gray-600">
            Upload a leaf image to detect and analyze plant diseases
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                {previewUrl ? (
                  <div className="relative w-full">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        Select Image
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedImage || loading}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium ${
                  loading || !selectedImage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } transition-colors`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FaLeaf className="mr-2" />
                    Analyze Leaf
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {error ? (
              <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="text-red-500 mr-3" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : result ? (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {result.disease.replace(/_/g, ' ')}
                </h2>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{result.information.description}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Symptoms</h3>
                    <p className="text-gray-600 leading-relaxed">{result.information.symptoms}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Treatment</h3>
                    <p className="text-gray-600 leading-relaxed">{result.information.treatment}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <FaLeaf className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg">Upload a leaf image to get started with the analysis</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LeafAnalysis; 
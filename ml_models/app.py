from flask import Flask, request, jsonify
import numpy as np
import os
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    TENSORFLOW_AVAILABLE = True
except ImportError:
    print("TensorFlow not available. Using alternative models.")
    TENSORFLOW_AVAILABLE = False
from flask_cors import CORS
import pickle
try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    print("joblib not available. Using built-in pickle.")
    JOBLIB_AVAILABLE = False
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    print("OpenCV not available. Image processing will not work.")
    CV2_AVAILABLE = False
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    print("pandas not available. Using simpler data structures.")
    PANDAS_AVAILABLE = False
import random
from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__)
CORS(app)

# Define upload folder for images
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Constants
LEAF_DISEASE_MODEL_PATH = 'models/model(1).h5'  # Updated path to your new model
IRRIGATION_MODEL_PATH = 'models/irrigation_model.h5'
SUPPLY_CHAIN_MODEL_PATH = 'models/supply_chain_model.pkl'
FERTILIZATION_MODEL_PATH = 'models/fertilization_model.h5'
SOIL_SCALER_PATH = 'models/scaler.pkl'  # Path for the scaler

# Load models (will be loaded once server starts)
leaf_disease_model = None
irrigation_model = None 
supply_chain_model = None
fertilization_model = None
soil_scaler = None

# Create simple standalone models for soil analysis if TensorFlow is not available
standalone_irrigation_model = None
standalone_fertilization_model = None

# Classes for leaf disease detection
LEAF_DISEASE_CLASSES = [
    'Apple___Apple_scab', 
    'Apple___Black_rot', 
    'Apple___Cedar_apple_rust', 
    'Apple___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 
    'Corn_(maize)___healthy',
    # Add more classes as needed
]

def create_standalone_models():
    """Create simple standalone models based on rules and scikit-learn"""
    global standalone_irrigation_model, standalone_fertilization_model
    
    try:
        # Simple Random Forest models
        standalone_irrigation_model = RandomForestClassifier(n_estimators=10)
        standalone_fertilization_model = RandomForestClassifier(n_estimators=10)
        
        # Generate some sample data based on our rules
        X_samples = []
        y_irrigation = []
        y_fertilization = []
        
        # Generate 100 random samples with rule-based labels
        for _ in range(100):
            # Random soil parameters
            sand = random.uniform(10, 90)
            clay = random.uniform(5, 80)
            silt = 100 - sand - clay
            ph = random.uniform(4.5, 8.5)
            ec = random.uniform(0.2, 2.0)
            om = random.uniform(0.5, 5)
            caco3 = random.uniform(0, 5)
            n_no3 = random.uniform(5, 50)
            p = random.uniform(5, 40)
            k = random.uniform(20, 200)
            mg = random.uniform(10, 100)
            fe = random.uniform(0.5, 5)
            zn = random.uniform(0.5, 5)
            mn = random.uniform(0.5, 5)
            cu = random.uniform(0.1, 2)
            b = random.uniform(0.1, 1.5)
            moisture = random.uniform(5, 30)
            temperature = random.uniform(15, 40)
            rainfall = random.uniform(0, 10)
            
            # Create feature vector
            features = [sand, clay, silt, ph, ec, om, caco3, n_no3, p, k, mg, fe, zn, mn, cu, b, moisture, temperature, rainfall]
            X_samples.append(features)
            
            # Apply rules for irrigation
            needs_irrigation = int(moisture < 15 or temperature > 32 or rainfall < 2)
            y_irrigation.append(needs_irrigation)
            
            # Apply rules for fertilization
            needs_fertilization = int(n_no3 < 20 or p < 15 or k < 80)
            y_fertilization.append(needs_fertilization)
        
        # Train the models
        standalone_irrigation_model.fit(X_samples, y_irrigation)
        standalone_fertilization_model.fit(X_samples, y_fertilization)
        
        print("Standalone models created successfully")
        return True
    except Exception as e:
        print(f"Error creating standalone models: {e}")
        return False

def load_models():
    """Load all ML models if available"""
    global leaf_disease_model, irrigation_model, supply_chain_model, fertilization_model, soil_scaler
    
    if TENSORFLOW_AVAILABLE:
        try:
            print(f"Attempting to load leaf disease model from: {LEAF_DISEASE_MODEL_PATH}")
            print(f"Current working directory: {os.getcwd()}")
            print(f"Directory contents: {os.listdir('models')}")
            print(f"TensorFlow version: {tf.__version__}")
            
            if os.path.exists(LEAF_DISEASE_MODEL_PATH):
                try:
                    # First attempt: Load with default settings
                    leaf_disease_model = load_model(LEAF_DISEASE_MODEL_PATH, compile=False)
                    print("Leaf disease model loaded successfully")
                except Exception as e:
                    print(f"Error during first model loading attempt: {str(e)}")
                    print("Attempting to load with custom_objects...")
                    try:
                        # Second attempt: Load with custom objects and safe_mode
                        leaf_disease_model = load_model(
                            LEAF_DISEASE_MODEL_PATH,
                            custom_objects={
                                'custom_activation': tf.nn.relu,
                                'relu': tf.nn.relu,
                                'ReLU': tf.keras.layers.ReLU
                            },
                            compile=False,
                            safe_mode=True
                        )
                        print("Leaf disease model loaded successfully with custom_objects")
                    except Exception as e2:
                        print(f"Error during second model loading attempt: {str(e2)}")
                        print("Attempting to load with legacy format...")
                        try:
                            # Third attempt: Load with legacy format
                            leaf_disease_model = tf.keras.models.load_model(
                                LEAF_DISEASE_MODEL_PATH,
                                compile=False,
                                custom_objects={
                                    'custom_activation': tf.nn.relu,
                                    'relu': tf.nn.relu,
                                    'ReLU': tf.keras.layers.ReLU
                                }
                            )
                            print("Leaf disease model loaded successfully with legacy format")
                        except Exception as e3:
                            print(f"Error during third model loading attempt: {str(e3)}")
                            print("Model loading failed after all attempts")
                            print(f"Model file size: {os.path.getsize(LEAF_DISEASE_MODEL_PATH)} bytes")
                            print(f"Model file path: {os.path.abspath(LEAF_DISEASE_MODEL_PATH)}")
                            # Create a simple mock model for fallback
                            leaf_disease_model = create_mock_model()
                            print("Created mock model for fallback")
            else:
                print(f"Error: Model file not found at {LEAF_DISEASE_MODEL_PATH}")
                # Create a simple mock model for fallback
                leaf_disease_model = create_mock_model()
                print("Created mock model for fallback")
        except Exception as e:
            print(f"Error loading leaf disease model: {str(e)}")
            print(f"TensorFlow version: {tf.__version__}")
            print(f"Model file size: {os.path.getsize(LEAF_DISEASE_MODEL_PATH) if os.path.exists(LEAF_DISEASE_MODEL_PATH) else 'File not found'}")
            # Create a simple mock model for fallback
            leaf_disease_model = create_mock_model()
            print("Created mock model for fallback")
        
        try:
            if os.path.exists(IRRIGATION_MODEL_PATH):
                irrigation_model = load_model(IRRIGATION_MODEL_PATH)
                print("Irrigation model loaded successfully")
        except Exception as e:
            print(f"Error loading irrigation model: {e}")
            
        try:
            if os.path.exists(FERTILIZATION_MODEL_PATH):
                fertilization_model = load_model(FERTILIZATION_MODEL_PATH)
                print("Fertilization model loaded successfully")
        except Exception as e:
            print(f"Error loading fertilization model: {e}")
    
    try:
        if os.path.exists(SUPPLY_CHAIN_MODEL_PATH):
            with open(SUPPLY_CHAIN_MODEL_PATH, 'rb') as f:
                supply_chain_model = pickle.load(f)
            print("Supply chain model loaded successfully")
    except Exception as e:
        print(f"Error loading supply chain model: {e}")
        
    try:
        if os.path.exists(SOIL_SCALER_PATH) and JOBLIB_AVAILABLE:
            soil_scaler = joblib.load(SOIL_SCALER_PATH)
            print("Soil scaler loaded successfully")
    except Exception as e:
        print(f"Error loading soil scaler: {e}")
        
    # Create standalone models if TensorFlow is not available
    if not TENSORFLOW_AVAILABLE:
        create_standalone_models()

def create_mock_model():
    """Create a simple mock model for fallback"""
    try:
        model = tf.keras.Sequential([
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(len(LEAF_DISEASE_CLASSES), activation='softmax')
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        print("Mock model created successfully")
        return model
    except Exception as e:
        print(f"Error creating mock model: {str(e)}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'models': {
            'leaf_disease': leaf_disease_model is not None,
            'irrigation': irrigation_model is not None,
            'supply_chain': supply_chain_model is not None,
            'fertilization': fertilization_model is not None,
            'soil_scaler': soil_scaler is not None
        },
        'libraries': {
            'tensorflow': TENSORFLOW_AVAILABLE,
            'opencv': 'cv2' in globals(),
            'pandas': PANDAS_AVAILABLE
        }
    })

@app.route('/predict/leaf-disease', methods=['POST'])
def predict_leaf_disease():
    """Predict plant disease from leaf image"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    if not TENSORFLOW_AVAILABLE:
        return jsonify({'error': 'TensorFlow is not available'}), 503
    
    if leaf_disease_model is None:
        print("Leaf disease model is not loaded. Current state:")
        print(f"TensorFlow available: {TENSORFLOW_AVAILABLE}")
        print(f"Model path exists: {os.path.exists(LEAF_DISEASE_MODEL_PATH)}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Directory contents: {os.listdir('models')}")
        print(f"TensorFlow version: {tf.__version__}")
        return jsonify({'error': 'Model not loaded. Please check server logs for details.'}), 503
    
    file = request.files['image']
    filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filename)
    
    try:
        # Preprocess the image
        img = cv2.imread(filename)
        if img is None:
            return jsonify({'error': 'Failed to read image'}), 400
            
        img = cv2.resize(img, (224, 224))  # Resize to match model input size
        img = img / 255.0  # Normalize
        img = np.expand_dims(img, axis=0)
        
        # Make prediction
        predictions = leaf_disease_model.predict(img)
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = LEAF_DISEASE_CLASSES[predicted_class_idx]
        confidence = float(predictions[0][predicted_class_idx])
        
        # Get additional info based on the disease
        disease_info = get_disease_info(predicted_class)
        
        # Check if we're using the mock model
        is_mock = isinstance(leaf_disease_model, tf.keras.Sequential) and len(leaf_disease_model.layers) == 8
        
        return jsonify({
            'disease': predicted_class,
            'confidence': confidence,
            'information': disease_info,
            'recommendations': disease_info.get('treatment', 'No specific treatment available'),
            'note': 'Using mock model for demonstration' if is_mock else None
        })
    
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up uploaded file
        if os.path.exists(filename):
            os.remove(filename)

@app.route('/predict/irrigation', methods=['POST'])
def predict_irrigation():
    """Predict optimal irrigation schedule"""
    if irrigation_model is None and TENSORFLOW_AVAILABLE:
        return jsonify({'error': 'Model not loaded'}), 503
    
    try:
        data = request.json
        required_fields = ['temperature', 'humidity', 'rainfall', 'soil_moisture', 'crop_type']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        if TENSORFLOW_AVAILABLE and irrigation_model is not None:
            # Preprocess input data
            input_data = np.array([
                [
                    data['temperature'], 
                    data['humidity'], 
                    data['rainfall'],
                    data['soil_moisture'],
                    encode_crop_type(data['crop_type'])
                ]
            ])
            
            # Make prediction
            prediction = irrigation_model.predict(input_data)
            
            # Interpret prediction
            irrigation_amount = float(prediction[0][0])  # in mm
        else:
            # Mock prediction
            temp = data['temperature']
            humidity = data['humidity']
            rainfall = data['rainfall']
            soil_moisture = data['soil_moisture']
            
            # Simple formula for mock result
            irrigation_amount = max(0, 5 - rainfall + (temp/10) - (humidity/20) - (soil_moisture/5))
        
        irrigation_schedule = get_irrigation_schedule(irrigation_amount, data)
        
        return jsonify({
            'note': '' if TENSORFLOW_AVAILABLE and irrigation_model is not None else 'Using mock prediction (TensorFlow not available)',
            'irrigation_amount': irrigation_amount,
            'recommended_schedule': irrigation_schedule,
            'water_saving_tips': get_water_saving_tips(data['crop_type'])
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/supply-chain', methods=['POST'])
def predict_supply_chain():
    """Predict supply chain metrics"""
    if supply_chain_model is None:
        # Return mock prediction
        location = request.json.get('location', 'Unknown')
        crop_type = request.json.get('crop_type', 'Unknown')
        
        return jsonify({
            'note': 'Using mock prediction (Model not available)',
            'optimal_harvest_window': f"{random.randint(5, 14)} days",
            'estimated_price_range': f"${random.uniform(1.5, 4.5):.2f} - ${random.uniform(4.5, 8.0):.2f} per unit",
            'suggested_markets': get_suggested_markets(location, crop_type),
            'storage_recommendations': get_storage_recommendations(crop_type),
            'transportation_options': get_transportation_options(request.json.get('quantity', 1000), location)
        })
    
    try:
        data = request.json
        required_fields = ['crop_type', 'harvest_date', 'quantity', 'location']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Preprocess input data for the model
        input_features = preprocess_supply_chain_data(data)
        
        # Make prediction
        prediction = supply_chain_model.predict(input_features)
        
        # Interpret prediction
        result = interpret_supply_chain_prediction(prediction, data)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/soil-analysis', methods=['POST'])
def predict_soil_needs():
    """Predict irrigation and fertilization needs based on soil analysis"""
    try:
        data = request.json
        
        # Extract features in the correct order
        features = np.array([
            data.get("Sand %", 0),
            data.get("Clay %", 0),
            data.get("Silt %", 0),
            data.get("pH", 0),
            data.get("EC mS/cm", 0),
            data.get("O.M. %", 0),
            data.get("CACO3 %", 0),
            data.get("N_NO3 ppm", 0),
            data.get("P ppm", 0),
            data.get("K ppm", 0),
            data.get("Mg ppm", 0),
            data.get("Fe ppm", 0),
            data.get("Zn ppm", 0),
            data.get("Mn ppm", 0),
            data.get("Cu ppm", 0),
            data.get("B ppm", 0),
            data.get("Moisture %", 0),
            data.get("Temperature °C", 0),
            data.get("Rainfall mm", 0),
        ]).reshape(1, -1)
        features_scaled = soil_scaler.transform(features)  # Scale input data

        irrigation_pred = irrigation_model.predict(features_scaled)
        fertilization_pred = fertilization_model.predict(features_scaled)

        irrigation_needed = bool(irrigation_pred[0][0] > 0.5)
        fertilization_needed = bool(fertilization_pred[0][0] > 0.5)
        # Generate recommendations based on predictions
        irrigation_recommendations = get_irrigation_recommendations(data, irrigation_needed)
        fertilization_recommendations = get_fertilization_recommendations(data, fertilization_needed)
        
        return jsonify({
            "model_type": "soil_analysis",
            "irrigation_needed": irrigation_needed,
            "fertilization_needed": fertilization_needed,
            "irrigation_recommendations": irrigation_recommendations,
            "fertilization_recommendations": fertilization_recommendations
        })
    
    except Exception as e:
        print(f"Error in soil analysis: {str(e)}")  # Print the error to the console
        return jsonify({'error': str(e)}), 500

# Helper functions
def get_disease_info(disease_class):
    """Return information about a specific plant disease"""
    # This would typically come from a database
    disease_info = {
        'Apple___Apple_scab': {
            'description': 'Apple scab is a common disease of apple trees caused by the fungus Venturia inaequalis.',
            'symptoms': 'Dark, scabby lesions on leaves and fruit',
            'treatment': 'Apply fungicide early in the growing season. Prune infected branches. Rake up and destroy fallen leaves.'
        },
        'Apple___Black_rot': {
            'description': 'Black rot is a fungal disease that affects apples, caused by Botryosphaeria obtusa.',
            'symptoms': 'Circular lesions on leaves, rotting fruit with concentric rings',
            'treatment': 'Prune out cankers and dead wood. Apply fungicides during the growing season.'
        },
        # Add more disease information as needed
    }
    
    # Return generic info if specific disease not found
    return disease_info.get(disease_class, {
        'description': 'Information not available for this specific disease',
        'symptoms': 'Refer to agricultural extension services for identification',
        'treatment': 'Consult with local agricultural experts for treatment options'
    })

def encode_crop_type(crop_type):
    """Encode crop type as numerical value"""
    # Simple encoding for demonstration
    crop_mapping = {
        'rice': 0,
        'wheat': 1,
        'corn': 2,
        'potato': 3,
        'tomato': 4,
        # Add more as needed
    }
    return crop_mapping.get(crop_type.lower(), 0)

def get_irrigation_recommendations(data, irrigation_needed):
    """Generate irrigation recommendations based on soil data"""
    if not irrigation_needed:
        return "No irrigation needed at this time."
    
    # Basic recommendations based on soil moisture and rainfall
    Moisture = data.get('moisture_pct', 0)
    Rainfall = data.get('rainfall', 0)
    Temperature = data.get('temperature', 0)
    
    if Moisture < 10:
        urgency = "Urgent irrigation needed"
    elif Moisture < 15:
        urgency = "Irrigation recommended soon"
    else:
        urgency = "Light irrigation recommended"
    
    if Rainfall > 5:
        rainfall_note = "Consider recent rainfall when planning irrigation."
    else:
        rainfall_note = "Limited recent rainfall detected."
    
    if Temperature > 30:
        temp_note = "Due to high temperatures, consider irrigating during early morning or evening to reduce evaporation."
    else:
        temp_note = "Current temperatures are optimal for regular irrigation scheduling."
    
    return f"{urgency}. {rainfall_note} {temp_note}"

def get_fertilization_recommendations(data, fertilization_needed):
    """Generate fertilization recommendations based on soil data"""
    if not fertilization_needed:
        return "No fertilization needed at this time."
    
    # Basic recommendations based on NPK levels
    n_level = data.get('N_NO3 ppm', 0)
    p_level = data.get('P ppm', 0)
    k_level = data.get('K ppm', 0)
    
    recommendations = []
    
    if n_level < 20:
        recommendations.append("Nitrogen deficiency detected. Consider adding nitrogen-rich fertilizer.")
    if p_level < 15:
        recommendations.append("Phosphorus levels are low. Add phosphate fertilizers for better root development.")
    if k_level < 80:
        recommendations.append("Potassium levels are below optimal. Supplement with potassium-rich fertilizers.")
    
    if not recommendations:
        recommendations.append("General fertilization recommended to maintain soil health.")
    
    # Add pH recommendation
    ph = data.get('ph', 7)
    if ph < 5.5:
        recommendations.append("Soil is acidic. Consider adding lime to raise pH.")
    elif ph > 7.5:
        recommendations.append("Soil is alkaline. Consider adding sulfur to lower pH.")
    
    return " ".join(recommendations)

def get_irrigation_schedule(irrigation_amount, data):
    """Generate irrigation schedule based on prediction and weather"""
    if irrigation_amount <= 0:
        return "No irrigation needed at this time"
    
    if data['humidity'] > 70:
        return f"Apply {irrigation_amount:.2f} mm of water over the next 3 days, dividing into smaller sessions"
    elif data['temperature'] > 30:
        return f"Apply {irrigation_amount:.2f} mm of water in the early morning or evening to reduce evaporation"
    else:
        return f"Apply {irrigation_amount:.2f} mm of water within the next 48 hours"

def get_water_saving_tips(crop_type):
    """Return water saving tips based on crop type"""
    # This would typically be more sophisticated
    general_tips = [
        "Use drip irrigation when possible",
        "Mulch around plants to reduce evaporation",
        "Check soil moisture before watering",
        "Water during cooler parts of the day"
    ]
    
    crop_specific_tips = {
        'rice': ["Consider alternate wetting and drying technique", "Maintain proper water levels at critical growth stages"],
        'wheat': ["Focus irrigation during germination and grain filling stages", "Use soil moisture sensors to optimize watering"],
        'corn': ["Ensure adequate water during silking and tasseling stages", "Use deficit irrigation during less critical growth phases"],
        # Add more as needed
    }
    
    tips = general_tips + crop_specific_tips.get(crop_type.lower(), [])
    return tips

def preprocess_supply_chain_data(data):
    """Preprocess supply chain data for the model"""
    # This would be implemented based on the actual model requirements
    # For demonstration, we return a simple array
    return np.array([[
        encode_crop_type(data['crop_type']),
        # Extract day of year from harvest_date
        150,  # Placeholder for day of year
        data['quantity'],
        # Encode location
        0,  # Placeholder for location encoding
    ]])

def interpret_supply_chain_prediction(prediction, data):
    """Interpret the supply chain model prediction"""
    # This would be implemented based on the actual model output
    # For demonstration purposes
    return {
        'optimal_harvest_window': '7 days',
        'estimated_price_range': f"${prediction[0]:.2f} - ${prediction[0] * 1.2:.2f} per unit",
        'suggested_markets': get_suggested_markets(data['location'], data['crop_type']),
        'storage_recommendations': get_storage_recommendations(data['crop_type']),
        'transportation_options': get_transportation_options(data['quantity'], data['location'])
    }

def get_suggested_markets(location, crop_type):
    """Get suggested markets based on location and crop type"""
    # This would typically come from a database or more complex model
    return [
        "Local farmers market",
        "Regional wholesale distributors",
        "Direct-to-consumer platforms"
    ]

def get_storage_recommendations(crop_type):
    """Get storage recommendations based on crop type"""
    storage_info = {
        'apple': "Store at 0-4°C with 90-95% humidity. Check regularly for rot.",
        'potato': "Cure for 2 weeks, then store at 7-10°C in dark, dry conditions.",
        'corn': "Store dried corn at 13% moisture content in cool, dry conditions."
    }
    return storage_info.get(crop_type.lower(), "Store in cool, dry conditions appropriate for crop type.")

def get_transportation_options(quantity, location):
    """Get transportation options based on quantity and location"""
    if quantity < 1000:
        return ["Small trucks", "Vans", "Local transport cooperatives"]
    else:
        return ["Large refrigerated trucks", "Regional shipping partners", "Bulk transport services"]

if __name__ == '__main__':
    load_models()
    print("Starting server on port 5050...")
    app.run(host='0.0.0.0', port=5050, debug=True) 
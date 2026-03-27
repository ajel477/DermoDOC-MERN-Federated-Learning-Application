"""
ML Prediction Server for Skin Disease Detection
Runs on port 5000 and serves predictions via Flask API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models import resnet50, ResNet50_Weights
from PIL import Image
import io
import numpy as np
import os
from werkzeug.utils import secure_filename

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB
UPLOAD_FOLDER = 'uploads'

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Device configuration
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {DEVICE}")

# Skin disease classes (10 diseases based on the notebook)
CLASSES = [
    '1. Eczema',
    '2. Melanoma',
    '3. Atopic Dermatitis',
    '4. Basal Cell Carcinoma (BCC)',
    '5. Melanocytic Nevi (NV)',
    '6. Benign Keratosis-like Lesions (BKL)',
    '7. Psoriasis',
    '8. Seborrheic Keratoses',
    '9. Tinea Ringworm Candidiasis',
    '10. Warts Molluscum'
]

# Simplified class names for output
SIMPLE_CLASSES = [
    'Eczema',
    'Melanoma',
    'Atopic Dermatitis',
    'Basal Cell Carcinoma',
    'Melanocytic Nevi',
    'Benign Keratosis',
    'Psoriasis',
    'Seborrheic Keratoses',
    'Tinea Ringworm',
    'Warts Molluscum'
]

num_classes = len(CLASSES)

# Image transforms (same as in notebook)
test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])


class ResNetModel(nn.Module):
    """ResNet50 model for skin disease classification"""
    def __init__(self, num_classes):
        super().__init__()
        self.model = resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)
        self.model.fc = nn.Linear(self.model.fc.in_features, num_classes)
    
    def forward(self, x):
        return self.model(x)


# Load model
def load_model():
    """Load the trained model or create a new one"""
    model = ResNetModel(num_classes).to(DEVICE)
    
    # Try to load saved weights if they exist
    model_path = 'federated_resnet50_skin_model.pth'
    if os.path.exists(model_path):
        print(f"Loading model from {model_path}")
        checkpoint = torch.load(model_path, map_location=DEVICE)
        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        else:
            model.load_state_dict(checkpoint)
    else:
        print("No saved model found. Using pretrained ResNet50 with untrained head.")
        print("Note: For production, train and save the model first.")
    
    model.eval()
    return model


# Initialize model
try:
    model = load_model()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def predict_image(image_tensor):
    """Get prediction from model"""
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted_class = torch.max(probabilities, 1)
    
    return predicted_class.item(), confidence.item()


@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint
    Expects multipart/form-data with 'image' file
    Returns JSON with class_name, confidence, and class_id
    """
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'ML model failed to load. Please check server logs.'
            }), 500
        
        # Check if image is in the request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        # Check if file has a filename
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large'}), 413
        
        # Check if file is allowed
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Invalid file type',
                'allowed_types': list(ALLOWED_EXTENSIONS)
            }), 400
        
        # Read and process image
        try:
            image = Image.open(io.BytesIO(file.read())).convert('RGB')
        except Exception as e:
            return jsonify({'error': 'Invalid image file', 'details': str(e)}), 400
        
        # Apply transforms
        image_tensor = test_transform(image).unsqueeze(0).to(DEVICE)
        
        # Get prediction
        class_idx, confidence = predict_image(image_tensor)
        
        # Prepare response
        response = {
            'class_id': int(class_idx),
            'class_name': SIMPLE_CLASSES[class_idx],
            'full_class_name': CLASSES[class_idx],
            'confidence': float(confidence),
            'confidence_percentage': float(confidence) * 100,
            'all_classes': SIMPLE_CLASSES
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return jsonify({'error': 'Prediction failed', 'details': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'device': str(DEVICE),
        'num_classes': num_classes,
        'classes': SIMPLE_CLASSES
    }), 200


@app.route('/info', methods=['GET'])
def info():
    """Get information about the model"""
    return jsonify({
        'model_name': 'Skin Disease Classifier',
        'framework': 'PyTorch',
        'architecture': 'ResNet50',
        'num_classes': num_classes,
        'classes': SIMPLE_CLASSES,
        'input_size': [224, 224],
        'device': str(DEVICE),
        'endpoint': '/predict',
        'method': 'POST',
        'content_type': 'multipart/form-data',
        'parameter_name': 'image'
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': {
            'POST /predict': 'Make a prediction',
            'GET /health': 'Check server health',
            'GET /info': 'Get model information'
        }
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("Starting Skin Disease Prediction Server...")
    print(f"Available classes: {SIMPLE_CLASSES}")
    print("Starting Flask app on http://127.0.0.1:5000")
    print("Endpoints:")
    print("  - POST /predict (expects 'image' file)")
    print("  - GET /health (check server status)")
    print("  - GET /info (get model information)")
    print("\nPress Ctrl+C to stop the server.")
    
    # Run the app
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=False,
        threaded=True
    )

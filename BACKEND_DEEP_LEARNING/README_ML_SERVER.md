# Skin Disease Prediction ML Server

This is a Flask-based API server for skin disease prediction. It provides a REST API endpoint for running inference on skin disease classification models.

## Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the server
```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

### 3. Test the server
```bash
curl -X POST -F "image=@your_image.jpg" http://127.0.0.1:5000/predict
```

## API Endpoints

### POST /predict
Makes a skin disease prediction from an uploaded image.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Parameter: `image` (file upload)

**Response:**
```json
{
  "class_id": 1,
  "class_name": "Melanoma",
  "full_class_name": "2. Melanoma",
  "confidence": 0.95,
  "confidence_percentage": 95.0,
  "all_classes": ["Eczema", "Melanoma", ...]
}
```

### GET /health
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "device": "cuda" or "cpu",
  "num_classes": 10,
  "classes": [...]
}
```

### GET /info
Get information about the model and API.

**Response:**
```json
{
  "model_name": "Skin Disease Classifier",
  "framework": "PyTorch",
  "architecture": "ResNet50",
  "num_classes": 10,
  "classes": [...],
  "endpoint": "/predict",
  "method": "POST"
}
```

## Supported Classes

1. Eczema
2. Melanoma
3. Atopic Dermatitis
4. Basal Cell Carcinoma
5. Melanocytic Nevi
6. Benign Keratosis
7. Psoriasis
8. Seborrheic Keratoses
9. Tinea Ringworm
10. Warts Molluscum

## File Specifications

- **Accepted formats:** PNG, JPG, JPEG, GIF, BMP
- **Max file size:** 16 MB
- **Input size:** 224×224 pixels (auto-resized)

## How to Train and Save a Model

1. Run the training cells in `skin-prediction-bbr.ipynb`
2. Save the model:
   ```python
   torch.save(model.state_dict(), 'skin_disease_model.pth')
   ```
3. Place the `skin_disease_model.pth` file in the same directory as `app.py`
4. The server will automatically load it on startup

## Troubleshooting

### Connection Refused
- Make sure the Flask server is running: `python app.py`
- Check that port 5000 is not in use by another application
- On Windows: `netstat -ano | findstr :5000` to check the port
- On Mac/Linux: `lsof -i :5000`

### CUDA Out of Memory
- If using GPU: Reduce batch size or use CPU mode
- The server automatically uses CPU if CUDA is not available

### Model Not Found
- Ensure `skin_disease_model.pth` is in the same directory as `app.py`
- Or train a new model and save it

### CORS Issues
- CORS is enabled by default, but ensure your frontend sends requests to `http://127.0.0.1:5000`

## Integration with Frontend

The frontend (React) sends requests like:
```javascript
const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

And expects the response format with `class_name` and `confidence` fields.

## Production Deployment

For production:
1. Train the model properly with your dataset
2. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
   ```
3. Use environment variables for configuration
4. Add authentication/authorization
5. Implement rate limiting
6. Set up logging and monitoring

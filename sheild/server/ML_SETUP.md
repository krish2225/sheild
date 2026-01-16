# ML Model Setup Guide

## Overview

This project uses Isolation Forest for anomaly detection in sensor data. The ML model:
- Trains automatically every 6 hours on historical data
- Detects anomalies in real-time sensor readings
- Calculates machine health scores and status

## Prerequisites

### Python Dependencies

Install required Python packages:

```bash
pip install numpy pandas scikit-learn
```

Or using requirements file:

```bash
pip install -r requirements.txt
```

### Node.js Dependencies

All Node.js dependencies are already in `package.json`. No additional packages needed.

## File Structure

```
server/
├── src/
│   ├── services/
│   │   ├── mlService.js          # ML service wrapper
│   │   ├── ml_train.py           # Python training script
│   │   ├── ml_predict.py         # Python prediction script
│   │   └── scheduler.js          # Scheduler for periodic training
│   ├── models/
│   │   └── SensorLog.js          # Updated with ML fields
│   └── routes/
│       └── predict.js             # Updated ML prediction endpoint
```

## How It Works

### 1. Data Storage

Sensor readings from Firebase are stored in MongoDB with the following structure:

```javascript
{
  machineId: "PM_001",
  timestamp: Date,
  temp_mean: Number,
  vib_rms: Number,
  current_rms: Number,
  edge_health: Number,
  anomaly: Number,        // 0 = normal, 1 = anomaly
  anomaly_score: Number    // 0-1 score from Isolation Forest
}
```

### 2. Model Training

- **Automatic**: Runs every 6 hours via scheduler
- **Manual**: POST `/api/predict/train`
- **Training Data**: Last 2500 sensor readings from MongoDB
- **Model**: Isolation Forest with 5% contamination rate

### 3. Real-time Prediction

When new sensor data arrives:
1. Data is stored in MongoDB
2. ML model predicts anomaly
3. Machine health score and status are updated
4. Results are returned to client

### 4. API Endpoints

#### Predict Anomaly
```bash
POST /api/predict
{
  "device_id": "PM_001",
  "features": {
    "temp_mean": 55,
    "vib_rms": 1.5,
    "current_rms": 2.5,
    "edge_health": 75
  }
}
```

#### Get Model Status
```bash
GET /api/predict/model-status
```

#### Manual Training
```bash
POST /api/predict/train
{
  "machineId": "PM_001"
}
```

#### Sync Firebase Data
```bash
POST /api/sensors/sync-firebase
{
  "machineId": "PM_001",
  "data": {
    "features": {
      "temp_mean": 55,
      "vib_rms": 1.5,
      "current_rms": 2.5
    },
    "edge_health": 75,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Machine State Calculation

Machine state is calculated based on ML predictions:

- **healthy**: No anomaly detected, all features within normal range
- **degrading**: Anomaly score > 0.3 or features approaching thresholds
- **critical**: Anomaly detected (anomaly = 1) or health score < 50

## Health Score Calculation

Health score is calculated as:
- If anomaly detected: `max(0, min(50, edge_health - 30))`
- If no anomaly: Uses `edge_health` from sensor data
- Fallback: Calculated from feature thresholds

## Troubleshooting

### Python Not Found

Ensure Python 3 is installed and in PATH:
```bash
python --version
# or
python3 --version
```

### ML Training Fails

1. Check Python dependencies are installed
2. Ensure MongoDB has at least 100 historical readings
3. Check server logs for detailed error messages
4. Try manual training: `POST /api/predict/train`

### Model Not Training

1. Check scheduler is running: `GET /api/predict/model-status`
2. Verify MongoDB connection
3. Check server logs for scheduler errors

## Production Considerations

1. **Model Storage**: Currently uses in-memory storage. For production:
   - Use Redis for model caching
   - Save models to file system or S3
   - Use joblib/pickle for model serialization

2. **Performance**: 
   - Consider using Node.js ML libraries (ml-matrix) instead of Python
   - Implement model versioning
   - Add model performance metrics

3. **Monitoring**:
   - Track training accuracy
   - Monitor prediction latency
   - Alert on training failures

4. **Data Quality**:
   - Validate input features
   - Handle missing data
   - Implement data quality checks







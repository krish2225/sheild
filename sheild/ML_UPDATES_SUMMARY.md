# ML System Updates Summary

## Overview
Updated the ML system to train every 5 minutes, optimize storage by deleting old data after training, and display RUL (Remaining Useful Life) on the frontend.

## Changes Made

### 1. Training Interval Changed
- **Before**: Training every 6 hours
- **After**: Training every 5 minutes
- **Location**: `server/src/services/scheduler.js`
- **Initial Training**: Now starts after 30 seconds (reduced from 1 minute)

### 2. Storage Optimization
- **Feature**: Automatic deletion of old training data after successful training
- **Logic**: Keeps only the most recent 500 records for future training
- **Location**: `server/src/services/mlService.js` - `trainModel()` method
- **Benefit**: Reduces MongoDB storage consumption while maintaining model accuracy

### 3. RUL (Remaining Useful Life) Calculation
- **Added**: `calculateRUL()` method in ML service
- **Calculation Logic**:
  - Based on health score, anomaly status, and feature values
  - Healthy (80-100%): 720-1000 hours (1-1.5 months)
  - Degrading (50-79%): 168-720 hours (1 week - 1 month)
  - Critical (<50%): 24-168 hours (1 day - 1 week)
  - Adjusted by feature severity (temperature, vibration, current)
- **Location**: `server/src/services/mlService.js`

### 4. API Updates
- **Prediction Endpoint**: Now includes `rul_hours` in response
- **Endpoint**: `POST /api/predict/predict`
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "device_id": "PM_001",
      "prediction": {
        "anomaly": 0,
        "anomaly_score": 0.15,
        "health_score": 85,
        "status": "healthy",
        "rul_hours": 850
      }
    }
  }
  ```

### 5. Frontend Updates

#### Dashboard Page (`client/src/pages/Dashboard.jsx`)
- Added RUL display card showing remaining useful life
- Shows ML prediction status (healthy/degrading/critical)
- Displays anomaly detection status
- Real-time ML predictions fetched when new sensor data arrives

#### Device Detail Page (`client/src/pages/DeviceDetail.jsx`)
- Added RUL display in Predictive Status section
- Shows ML health score
- Displays anomaly detection status with score
- Updated status to use ML predictions when available

#### New ML Service (`client/src/services/mlService.js`)
- `getMLPrediction()`: Fetches ML predictions from backend
- `formatRUL()`: Formats RUL hours to human-readable format (hours, days, weeks)

### 6. Data Flow
1. **Sensor Data Arrives** → Firebase → Frontend
2. **Frontend** → Calls ML API with sensor features
3. **ML Service** → Calculates anomaly, health score, status, and RUL
4. **Frontend** → Displays RUL and ML predictions on Dashboard/DeviceDetail
5. **Every 5 Minutes** → Model retrains on latest 500 records
6. **After Training** → Old data deleted (keeping only 500 most recent)

## Files Modified

### Backend
- `server/src/services/scheduler.js` - Changed interval to 5 minutes
- `server/src/services/mlService.js` - Added RUL calculation, data deletion
- `server/src/routes/predict.js` - Updated to include RUL in response

### Frontend
- `client/src/pages/Dashboard.jsx` - Added RUL display and ML integration
- `client/src/pages/DeviceDetail.jsx` - Added RUL and ML status display
- `client/src/services/mlService.js` - New service for ML API calls

## Benefits

1. **Faster Model Updates**: Model retrains every 5 minutes instead of 6 hours
2. **Storage Efficient**: Only keeps 500 most recent records, deletes older data
3. **RUL Visibility**: Users can see remaining useful life directly on dashboard
4. **Better Predictions**: More frequent training means model adapts faster to changes
5. **Real-time ML**: ML predictions update in real-time as sensor data arrives

## Testing

To test the new features:
1. Check model status: `GET /api/predict/model-status`
2. Make prediction: `POST /api/predict/predict` with sensor features
3. View Dashboard: RUL should appear when ML prediction is available
4. View Device Detail: RUL and ML status should be displayed

## Notes

- Model training happens automatically every 5 minutes
- Old data is deleted after each successful training
- RUL calculation is based on health score and feature values
- Frontend gracefully handles cases where ML prediction is not available







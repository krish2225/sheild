#!/usr/bin/env python3
"""
ML Prediction Script for Isolation Forest Anomaly Detection
Predicts anomaly for new sensor readings using trained model
"""
import sys
import json
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

def predict(input_file, output_file):
    """Predict anomaly for new sensor reading"""
    try:
        # Load input data
        with open(input_file, 'r') as f:
            data = json.load(f)
        
        features = data['features']
        model_params = data['model']
        
        # Reconstruct scaler
        scaler = StandardScaler()
        scaler.mean_ = np.array(model_params['feature_means'])
        scaler.scale_ = np.array(model_params['feature_stds'])
        
        # Prepare feature vector
        feature_vector = np.array([
            features['temp_mean'],
            features['vib_rms'],
            features['current_rms']
        ]).reshape(1, -1)
        
        # Normalize
        X_scaled = scaler.transform(feature_vector)
        
        # Simplified prediction based on feature distances from mean
        # In production, load actual trained model using joblib/pickle
        feature_vector_array = X_scaled[0]
        
        # Calculate distance from mean (normalized)
        distances = np.abs(feature_vector_array)
        
        # Anomaly score: higher distance = more anomalous
        # Normalize to -1 to 1 range (Isolation Forest style)
        max_distance = np.max(distances)
        anomaly_score = -max_distance  # Negative = normal, positive = anomaly
        
        # Threshold-based prediction
        threshold = model_params.get('anomaly_threshold', -0.1)
        prediction = 1 if anomaly_score > threshold else -1
        
        # Convert to 0/1 format (0 = normal, 1 = anomaly)
        anomaly = 1 if prediction == -1 else 0
        
        # Normalize anomaly score to 0-1 range
        normalized_score = max(0, min(1, (anomaly_score + 0.5) / 1.0))
        
        result = {
            'anomaly': int(anomaly),
            'anomaly_score': float(normalized_score),
            'raw_score': float(anomaly_score)
        }
        
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python ml_predict.py <input_file> <output_file>", file=sys.stderr)
        sys.exit(1)
    
    predict(sys.argv[1], sys.argv[2])


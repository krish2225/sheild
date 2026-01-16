#!/usr/bin/env python3
"""
ML Training Script for Isolation Forest Anomaly Detection
Trains model on historical sensor data and saves model parameters
"""
import sys
import json
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

def train_model(input_file, output_file):
    """Train Isolation Forest model on historical data"""
    try:
        # Load training data
        with open(input_file, 'r') as f:
            data = json.load(f)
        
        df = pd.DataFrame(data)
        
        # Select features for training
        features = ['temp_mean', 'vib_rms', 'current_rms']
        
        if len(df) < 100:
            raise ValueError(f"Insufficient data: {len(df)} samples. Need at least 100.")
        
        # Prepare feature matrix
        X = df[features].values
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train Isolation Forest
        contamination = 0.05  # Expect 5% anomalies
        iso_forest = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42,
            n_jobs=-1
        )
        
        iso_forest.fit(X_scaled)
        
        # Predict on training data to get anomaly rate
        predictions = iso_forest.predict(X_scaled)
        anomaly_rate = (predictions == -1).sum() / len(predictions)
        
        # Calculate feature statistics for normalization
        feature_means = scaler.mean_.tolist()
        feature_stds = scaler.scale_.tolist()
        
        # Save model parameters (in production, use joblib/pickle)
        model_data = {
            'contamination': contamination,
            'n_estimators': 100,
            'anomaly_threshold': -0.1,  # Threshold for anomaly scores
            'feature_means': feature_means,
            'feature_stds': feature_stds,
            'anomaly_rate': float(anomaly_rate),
            'training_samples': len(df),
            'features': features
        }
        
        with open(output_file, 'w') as f:
            json.dump(model_data, f, indent=2)
        
        print(f"Model trained successfully on {len(df)} samples")
        print(f"Anomaly rate: {anomaly_rate:.2%}")
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python ml_train.py <input_file> <output_file>", file=sys.stderr)
        sys.exit(1)
    
    train_model(sys.argv[1], sys.argv[2])







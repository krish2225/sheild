import SensorLog from '../models/SensorLog.js';
import { createLogger } from '../config/logger.js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = createLogger();

// Model persistence file path
const MODEL_FILE = join(__dirname, '../../models/ml_model.json');

/**
 * Initialize ML dependencies
 * Note: This requires Python with scikit-learn, numpy, pandas
 * For Node.js, we'll use a Python subprocess or a Node.js ML library
 * 
 * For now, we'll create a service that can be called via Python script
 * or we can use a Node.js ML library like ml-matrix
 */
export class MLService {
  constructor() {
    this.model = null;
    this.scaler = null;
    this.lastTrainingTime = null;
    this.isTraining = false;
  }

  /**
   * Train Isolation Forest model with historical data
   * This will be called every 6 hours via scheduler
   */
  async trainModel(machineId = 'PM_001') {
    if (this.isTraining) {
      logger.warn('ML model training already in progress');
      return;
    }

    this.isTraining = true;
    logger.info(`Starting ML model training for machine: ${machineId}`);

    try {
      // Fetch historical data from database
      const historicalData = await SensorLog.find({
        machineId,
        temp_mean: { $exists: true, $ne: null },
        vib_rms: { $exists: true, $ne: null },
        current_rms: { $exists: true, $ne: null }
      })
        .sort({ timestamp: -1 })
        .limit(2500) // Use last 2500 samples
        .select('temp_mean vib_rms current_rms edge_health timestamp')
        .lean();

      if (historicalData.length < 100) {
        logger.warn(`Insufficient data for training. Need at least 100 samples, got ${historicalData.length}`);
        this.isTraining = false;
        return;
      }

      logger.info(`Training with ${historicalData.length} samples`);

      // Prepare data for Python ML script
      const trainingData = historicalData.map(d => ({
        temp_mean: d.temp_mean || 0,
        vib_rms: d.vib_rms || 0,
        current_rms: d.current_rms || 0,
        edge_health: d.edge_health || 0
      }));

      // Call Python ML training script
      const { spawn } = await import('child_process');
      const { writeFileSync, readFileSync, unlinkSync } = await import('fs');
      const { join } = await import('path');
      const { tmpdir } = await import('os');

      const inputFile = join(tmpdir(), `ml_training_${Date.now()}.json`);
      const outputFile = join(tmpdir(), `ml_model_${Date.now()}.json`);

      try {
        // Write training data to temp file
        writeFileSync(inputFile, JSON.stringify(trainingData));

        // Run Python ML script
        const pythonScript = join(process.cwd(), 'src', 'services', 'ml_train.py');
        
        return new Promise((resolve, reject) => {
          const python = spawn('python', [pythonScript, inputFile, outputFile]);

          let stdout = '';
          let stderr = '';

          python.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          python.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          python.on('close', async (code) => {
            try {
              if (code !== 0) {
                logger.error(`Python ML script failed: ${stderr}`);
                reject(new Error(`ML training failed: ${stderr}`));
                return;
              }

              // Read model results
              const modelData = JSON.parse(readFileSync(outputFile, 'utf8'));
              
              // Store model parameters (in production, use proper model storage)
              this.model = {
                contamination: modelData.contamination,
                n_estimators: modelData.n_estimators,
                anomaly_threshold: modelData.anomaly_threshold,
                feature_means: modelData.feature_means,
                feature_stds: modelData.feature_stds
              };

              this.scaler = {
                mean: modelData.feature_means,
                std: modelData.feature_stds
              };

              this.lastTrainingTime = new Date();
              
              logger.info(`ML model trained successfully. Anomaly rate: ${modelData.anomaly_rate}`);
              
              // Save model to disk for persistence
              this.saveModel();
              
              // Delete old training data after successful training to save storage
              // Keep only the most recent 500 records for future training
              if (historicalData.length > 500) {
                const oldestTimestamp = historicalData[500].timestamp;
                const deleted = await SensorLog.deleteMany({
                  machineId,
                  timestamp: { $lt: oldestTimestamp }
                });
                logger.info(`Deleted ${deleted.deletedCount} old training records to optimize storage`);
              }
              
              // Clean up temp files
              unlinkSync(inputFile);
              unlinkSync(outputFile);
              
              resolve(this.model);
            } catch (error) {
              logger.error(`Error processing ML results: ${error.message}`);
              reject(error);
            } finally {
              this.isTraining = false;
            }
          });
        });
      } catch (error) {
        logger.error(`ML training error: ${error.message}`);
        this.isTraining = false;
        throw error;
      }
    } catch (error) {
      logger.error(`ML training failed: ${error.message}`);
      this.isTraining = false;
      throw error;
    }
  }

  /**
   * Predict anomaly for new sensor reading
   */
  async predict(features) {
    if (!this.model || !this.scaler) {
      logger.warn('ML model not trained yet. Using fallback logic.');
      return this.fallbackPrediction(features);
    }

    try {
      // Normalize features
      const normalized = {
        temp_mean: (features.temp_mean - this.scaler.mean[0]) / this.scaler.std[0],
        vib_rms: (features.vib_rms - this.scaler.mean[1]) / this.scaler.std[1],
        current_rms: (features.current_rms - this.scaler.mean[2]) / this.scaler.std[2]
      };

      // Call Python prediction script
      const { spawn } = await import('child_process');
      const { writeFileSync, readFileSync, unlinkSync } = await import('fs');
      const { join } = await import('path');
      const { tmpdir } = await import('os');

      const inputFile = join(tmpdir(), `ml_predict_${Date.now()}.json`);
      const outputFile = join(tmpdir(), `ml_result_${Date.now()}.json`);

      try {
        writeFileSync(inputFile, JSON.stringify({
          features: normalized,
          model: this.model
        }));

        const pythonScript = join(process.cwd(), 'src', 'services', 'ml_predict.py');
        
        return new Promise((resolve, reject) => {
          const python = spawn('python', [pythonScript, inputFile, outputFile]);

          let stderr = '';

          python.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          python.on('close', async (code) => {
            try {
              if (code !== 0) {
                logger.error(`Python prediction failed: ${stderr}`);
                resolve(this.fallbackPrediction(features));
                return;
              }

              const result = JSON.parse(readFileSync(outputFile, 'utf8'));
              
              unlinkSync(inputFile);
              unlinkSync(outputFile);

              const healthScore = this.calculateHealthScore(features, result.anomaly);
              const status = this.getStatus(result.anomaly, features);
              const rul = this.calculateRUL(features, result.anomaly, healthScore);

              resolve({
                anomaly: result.anomaly,
                anomaly_score: result.anomaly_score,
                health_score: healthScore,
                status: status,
                rul_hours: rul
              });
            } catch (error) {
              logger.error(`Error processing prediction: ${error.message}`);
              resolve(this.fallbackPrediction(features));
            }
          });
        });
      } catch (error) {
        logger.error(`Prediction error: ${error.message}`);
        return this.fallbackPrediction(features);
      }
    } catch (error) {
      logger.error(`Prediction failed: ${error.message}`);
      return this.fallbackPrediction(features);
    }
  }

  /**
   * Fallback prediction when ML model is not available
   */
  fallbackPrediction(features) {
    const { temp_mean = 0, vib_rms = 0, current_rms = 0, edge_health = 0 } = features;
    
    // Simple threshold-based anomaly detection
    let anomaly = 0;
    let anomaly_score = 0;

    if (temp_mean > 70 || vib_rms > 3.0 || current_rms > 6.0) {
      anomaly = 1;
      anomaly_score = 0.8;
    } else if (temp_mean > 60 || vib_rms > 2.0 || current_rms > 4.0) {
      anomaly_score = 0.3;
    }

    const healthScore = this.calculateHealthScore(features, anomaly);
    const status = this.getStatus(anomaly, features);
    const rul = this.calculateRUL(features, anomaly, healthScore);

    return {
      anomaly,
      anomaly_score,
      health_score: healthScore,
      status: status,
      rul_hours: rul
    };
  }

  /**
   * Calculate health score based on features and anomaly
   */
  calculateHealthScore(features, anomaly) {
    const { temp_mean = 0, vib_rms = 0, current_rms = 0, edge_health = 0 } = features;
    
    if (anomaly === 1) {
      // If anomaly detected, health score is low
      return Math.max(0, Math.min(50, edge_health - 30));
    }

    // Use edge_health if available, otherwise calculate
    if (edge_health > 0) {
      return Math.max(0, Math.min(100, edge_health));
    }

    // Calculate based on thresholds
    let score = 100;
    if (temp_mean > 60) score -= 20;
    if (vib_rms > 2.0) score -= 15;
    if (current_rms > 4.0) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get machine status based on anomaly and features
   */
  getStatus(anomaly, features) {
    if (anomaly === 1) {
      return 'critical';
    }

    const { temp_mean = 0, vib_rms = 0, current_rms = 0 } = features;
    
    if (temp_mean > 60 || vib_rms > 2.0 || current_rms > 4.0) {
      return 'degrading';
    }

    return 'healthy';
  }

  /**
   * Calculate Remaining Useful Life (RUL) in hours
   * Based on health score, anomaly status, and feature values
   */
  calculateRUL(features, anomaly, healthScore) {
    const { temp_mean = 0, vib_rms = 0, current_rms = 0, edge_health = 0 } = features;
    
    // If anomaly detected, RUL is very low
    if (anomaly === 1) {
      // Critical condition - estimate 1-24 hours
      return Math.max(1, Math.min(24, healthScore / 2));
    }

    // Base RUL calculation from health score
    // Healthy machine (80-100): 720-1000 hours (1-1.5 months)
    // Degrading (50-79): 168-720 hours (1 week - 1 month)
    // Critical (<50): 24-168 hours (1 day - 1 week)
    
    let baseRUL = 0;
    
    if (healthScore >= 80) {
      // Healthy: 720-1000 hours
      baseRUL = 720 + ((healthScore - 80) / 20) * 280;
    } else if (healthScore >= 50) {
      // Degrading: 168-720 hours
      baseRUL = 168 + ((healthScore - 50) / 30) * 552;
    } else {
      // Critical: 24-168 hours
      baseRUL = 24 + ((healthScore - 0) / 50) * 144;
    }

    // Adjust based on feature severity
    let adjustment = 1.0;
    
    if (temp_mean > 70) adjustment *= 0.5; // High temp reduces RUL
    else if (temp_mean > 60) adjustment *= 0.7;
    
    if (vib_rms > 3.0) adjustment *= 0.6; // High vibration reduces RUL
    else if (vib_rms > 2.0) adjustment *= 0.8;
    
    if (current_rms > 6.0) adjustment *= 0.5; // High current reduces RUL
    else if (current_rms > 4.0) adjustment *= 0.8;

    const finalRUL = Math.round(baseRUL * adjustment);
    
    // Ensure minimum of 1 hour and maximum of 1000 hours
    return Math.max(1, Math.min(1000, finalRUL));
  }

  /**
   * Save model to disk for persistence
   */
  saveModel() {
    try {
      const modelData = {
        model: this.model,
        scaler: this.scaler,
        lastTrainingTime: this.lastTrainingTime ? this.lastTrainingTime.toISOString() : null
      };
      writeFileSync(MODEL_FILE, JSON.stringify(modelData, null, 2));
      logger.info('Model saved to disk');
    } catch (error) {
      logger.error(`Failed to save model: ${error.message}`);
    }
  }

  /**
   * Load model from disk
   */
  loadModel() {
    try {
      if (existsSync(MODEL_FILE)) {
        const modelData = JSON.parse(readFileSync(MODEL_FILE, 'utf-8'));
        this.model = modelData.model;
        this.scaler = modelData.scaler;
        this.lastTrainingTime = modelData.lastTrainingTime ? new Date(modelData.lastTrainingTime) : null;
        logger.info('Model loaded from disk');
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to load model: ${error.message}`);
      return false;
    }
  }

  /**
   * Get model status
   */
  getModelStatus() {
    return {
      isTrained: !!this.model,
      lastTrainingTime: this.lastTrainingTime,
      isTraining: this.isTraining
    };
  }
}

// Export singleton instance
export const mlService = new MLService();

// Load model on startup if it exists
mlService.loadModel();


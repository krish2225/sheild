import { Router } from 'express';
import { mlService } from '../services/mlService.js';
import { createLogger } from '../config/logger.js';

const router = Router();
const logger = createLogger();

/**
 * POST /api/predict
 * 
 * ML PREDICTION ENDPOINT
 * 
 * Uses Isolation Forest model to predict anomalies and machine health
 * 
 * Expected request body:
 * {
 *   "device_id": "PM_001",
 *   "features": {
 *     "temp_mean": 45,
 *     "vib_rms": 1.2,
 *     "current_rms": 2.1,
 *     "edge_health": 75
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "device_id": "PM_001",
 *     "prediction": {
 *       "anomaly": 0,
 *       "anomaly_score": 0.15,
 *       "health_score": 85,
 *       "status": "healthy"
 *     },
 *     "timestamp": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 */
router.post('/predict', async (req, res) => {
  try {
    const { device_id, features } = req.body;

    if (!device_id || !features) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: device_id and features'
      });
    }

    const { temp_mean, vib_rms, current_rms, edge_health } = features;

    if (temp_mean === undefined || vib_rms === undefined || current_rms === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required features: temp_mean, vib_rms, current_rms'
      });
    }

    // Get ML prediction
    const prediction = await mlService.predict({
      temp_mean,
      vib_rms,
      current_rms,
      edge_health: edge_health || 0
    });

    res.json({
      success: true,
      data: {
        device_id,
        prediction: {
          anomaly: prediction.anomaly,
          anomaly_score: prediction.anomaly_score,
          health_score: prediction.health_score,
          status: prediction.status,
          rul_hours: prediction.rul_hours
        },
        timestamp: new Date().toISOString(),
        model_status: mlService.getModelStatus()
      }
    });
  } catch (error) {
    logger.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Prediction failed',
      error: error.message
    });
  }
});

/**
 * GET /api/predict/model-status
 * 
 * Get ML model training status
 */
router.get('/model-status', (req, res) => {
  try {
    const status = mlService.getModelStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Model status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get model status',
      error: error.message
    });
  }
});

/**
 * POST /api/predict/train
 * 
 * Manually trigger ML model training
 */
router.post('/train', async (req, res) => {
  try {
    const { machineId = 'PM_001' } = req.body;
    
    logger.info(`Manual ML training triggered for machine: ${machineId}`);
    
    await mlService.trainModel(machineId);
    
    res.json({
      success: true,
      message: 'ML model training completed',
      data: mlService.getModelStatus()
    });
  } catch (error) {
    logger.error('Training error:', error);
    res.status(500).json({
      success: false,
      message: 'Training failed',
      error: error.message
    });
  }
});

export default router;




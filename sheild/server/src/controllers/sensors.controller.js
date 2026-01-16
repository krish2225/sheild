import Machine from '../models/Machine.js';
import SensorLog from '../models/SensorLog.js';
import { ok, created, badRequest } from '../utils/response.js';
import { mlService } from '../services/mlService.js';
import { createLogger } from '../config/logger.js';

const logger = createLogger();

export const ingestSensor = async (req, res) => {
  const { 
    machineId, 
    temperature, 
    vibration, 
    current, 
    timestamp, 
    features,
    // ML model features from Firebase
    temp_mean,
    vib_rms,
    current_rms,
    edge_health
  } = req.body;
  
  if (!machineId) return badRequest(res, 'machineId required');
  const ts = timestamp ? new Date(timestamp) : new Date();

  const machine = await Machine.findOne({ machineId });
  if (!machine) return badRequest(res, 'Unknown machineId');

  // Use ML features if available, otherwise use legacy fields
  const logData = {
    machine: machine._id,
    machineId,
    timestamp: ts,
    temperature: temperature || temp_mean,
    vibration: vibration || vib_rms,
    current: current || current_rms,
    features,
    // ML model features
    temp_mean: temp_mean || temperature,
    vib_rms: vib_rms || vibration,
    current_rms: current_rms || current,
    edge_health: edge_health || null
  };

  const log = await SensorLog.create(logData);

  // Run ML prediction if features are available
  let mlPrediction = null;
  if (temp_mean !== undefined && vib_rms !== undefined && current_rms !== undefined) {
    try {
      mlPrediction = await mlService.predict({
        temp_mean,
        vib_rms,
        current_rms,
        edge_health: edge_health || 0
      });

      // Update log with ML prediction
      log.anomaly = mlPrediction.anomaly;
      log.anomaly_score = mlPrediction.anomaly_score;
      await log.save();

      // Update machine health based on ML prediction
      machine.healthScore = mlPrediction.health_score;
      machine.status = mlPrediction.status;
    } catch (error) {
      logger.error(`ML prediction failed: ${error.message}`);
      // Fallback to simple calculation if ML fails
      const score = 100 - Math.min(100, (vib_rms || 0) * 2 + Math.max(0, (temp_mean || 0) - 60));
      machine.healthScore = Math.max(0, Math.min(100, score));
      machine.status = machine.healthScore < 40 ? 'faulty' : machine.healthScore < 70 ? 'warning' : 'normal';
    }
  } else {
    // Fallback to simple calculation
    const score = 100 - Math.min(100, (vibration || 0) * 2 + Math.max(0, (temperature || 0) - 60));
    machine.healthScore = Math.max(0, Math.min(100, score));
    machine.status = machine.healthScore < 40 ? 'faulty' : machine.healthScore < 70 ? 'warning' : 'normal';
  }

  machine.lastSeenAt = ts;
  await machine.save();

  return created(res, { log, machine, mlPrediction });
};

export const querySensorLogs = async (req, res) => {
  try {
    const { machineId } = req.params;
    const { from, to, limit = 500 } = req.query;
    const filter = { machineId };
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }
    const logs = await SensorLog.find(filter).sort({ timestamp: -1 }).limit(Number(limit));
    return ok(res, { logs });
  } catch (error) {
    logger.error(`Error querying sensor logs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to query logs',
      error: error.message
    });
  }
};

/**
 * Sync Firebase data to MongoDB
 * This endpoint can be called periodically to sync Firebase readings to MongoDB
 */
export const syncFirebaseData = async (req, res) => {
  try {
    const { machineId, data } = req.body;
    
    logger.info(`[syncFirebaseData] Received sync request for machine: ${machineId}`);
    
    if (!machineId || !data) {
      logger.warn(`[syncFirebaseData] Missing required fields - machineId: ${!!machineId}, data: ${!!data}`);
      return badRequest(res, 'machineId and data required');
    }

    const machine = await Machine.findOne({ machineId });
    if (!machine) {
      logger.warn(`[syncFirebaseData] Machine not found: ${machineId}`);
      return badRequest(res, `Unknown machineId: ${machineId}`);
    }

    // Extract features from Firebase data structure
    const features = data.features || {};
    
    // Handle timestamp - can be ISO string or number
    let timestamp;
    try {
      if (data.timestamp) {
        if (typeof data.timestamp === 'string') {
          timestamp = new Date(data.timestamp);
        } else if (typeof data.timestamp === 'number') {
          // If it's a Unix timestamp in seconds, convert to milliseconds
          timestamp = data.timestamp < 1e12 ? new Date(data.timestamp * 1000) : new Date(data.timestamp);
        } else {
          timestamp = new Date(data.timestamp);
        }
      } else {
        timestamp = new Date();
      }

      // Validate timestamp
      if (isNaN(timestamp.getTime())) {
        logger.warn(`[syncFirebaseData] Invalid timestamp: ${data.timestamp}, using current time`);
        timestamp = new Date();
      }
    } catch (tsError) {
      logger.warn(`[syncFirebaseData] Timestamp parsing error: ${tsError.message}, using current time`);
      timestamp = new Date();
    }

    // Build log data with safe defaults
    const logData = {
      machine: machine._id,
      machineId,
      timestamp,
      temp_mean: features.temp_mean ?? null,
      vib_rms: features.vib_rms ?? null,
      current_rms: features.current_rms ?? null,
      edge_health: data.edge_health ?? null,
      temperature: features.temp_mean ?? null,
      vibration: features.vib_rms ?? null,
      current: features.current_rms ?? null
    };

    // Run ML prediction (non-blocking, continue even if it fails)
    let mlPrediction = null;
    if (features.temp_mean !== undefined && features.vib_rms !== undefined && features.current_rms !== undefined) {
      try {
        mlPrediction = await mlService.predict({
          temp_mean: features.temp_mean,
          vib_rms: features.vib_rms,
          current_rms: features.current_rms,
          edge_health: data.edge_health || 0
        });

        if (mlPrediction) {
          logData.anomaly = mlPrediction.anomaly ?? 0;
          logData.anomaly_score = mlPrediction.anomaly_score ?? null;

          // Update machine health
          if (mlPrediction.health_score !== undefined) {
            machine.healthScore = mlPrediction.health_score;
          }
          if (mlPrediction.status) {
            machine.status = mlPrediction.status;
          }
        }
      } catch (mlError) {
        logger.error(`[syncFirebaseData] ML prediction failed: ${mlError.message}`);
        logger.error(`[syncFirebaseData] ML error stack: ${mlError.stack}`);
        // Continue without ML prediction - don't fail the sync
      }
    } else {
      logger.debug(`[syncFirebaseData] Skipping ML prediction - missing features`);
    }

    // Create sensor log
    const log = await SensorLog.create(logData);
    logger.info(`[syncFirebaseData] Created sensor log: ${log._id}`);
    
    // Update machine last seen
    machine.lastSeenAt = timestamp;
    await machine.save();

    return created(res, { 
      log, 
      machine, 
      mlPrediction,
      message: 'Firebase data synced successfully' 
    });
  } catch (error) {
    logger.error(`[syncFirebaseData] ✗✗✗ CRITICAL ERROR:`);
    logger.error(`[syncFirebaseData] Error message: ${error.message}`);
    logger.error(`[syncFirebaseData] Error stack: ${error.stack}`);
    logger.error(`[syncFirebaseData] Request body: ${JSON.stringify(req.body, null, 2)}`);
    
    return res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

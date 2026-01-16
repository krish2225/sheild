import { createLogger } from '../config/logger.js';
import Machine from '../models/Machine.js';
import SensorLog from '../models/SensorLog.js';
import { mlService } from './mlService.js';

const logger = createLogger();

/**
 * Firebase Sync Service
 * Syncs Firebase sensor data to MongoDB and runs ML predictions
 */
export class FirebaseSyncService {
  /**
   * Sync a single reading from Firebase to MongoDB
   * @param {string} machineId - Machine ID (e.g., 'PM_001')
   * @param {object} firebaseData - Data from Firebase
   */
  async syncReading(machineId, firebaseData) {
    try {
      const machine = await Machine.findOne({ machineId });
      if (!machine) {
        logger.warn(`Machine not found: ${machineId}`);
        return { success: false, error: 'Machine not found' };
      }

      // Extract features from Firebase data structure
      // Expected structure: { features: { temp_mean, vib_rms, current_rms }, edge_health, timestamp }
      const features = firebaseData.features || {};
      const timestamp = firebaseData.timestamp 
        ? new Date(firebaseData.timestamp) 
        : new Date();

      if (!features.temp_mean || !features.vib_rms || !features.current_rms) {
        logger.warn(`Incomplete features for machine ${machineId}`);
        return { success: false, error: 'Missing required features' };
      }

      // Prepare log data
      const logData = {
        machine: machine._id,
        machineId,
        timestamp,
        temp_mean: features.temp_mean,
        vib_rms: features.vib_rms,
        current_rms: features.current_rms,
        edge_health: firebaseData.edge_health || null,
        temperature: features.temp_mean,
        vibration: features.vib_rms,
        current: features.current_rms
      };

      // Run ML prediction
      let mlPrediction = null;
      try {
        mlPrediction = await mlService.predict({
          temp_mean: features.temp_mean,
          vib_rms: features.vib_rms,
          current_rms: features.current_rms,
          edge_health: firebaseData.edge_health || 0
        });

        logData.anomaly = mlPrediction.anomaly;
        logData.anomaly_score = mlPrediction.anomaly_score;

        // Update machine health based on ML prediction
        machine.healthScore = mlPrediction.health_score;
        machine.status = mlPrediction.status;
      } catch (error) {
        logger.error(`ML prediction failed during sync: ${error.message}`);
        // Continue without ML prediction
      }

      // Save to database
      const log = await SensorLog.create(logData);
      machine.lastSeenAt = timestamp;
      await machine.save();

      logger.info(`Synced reading for ${machineId} at ${timestamp.toISOString()}`);

      return {
        success: true,
        log,
        machine,
        mlPrediction
      };
    } catch (error) {
      logger.error(`Firebase sync error for ${machineId}: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sync multiple readings in batch
   * @param {string} machineId - Machine ID
   * @param {array} readings - Array of Firebase readings
   */
  async syncBatch(machineId, readings) {
    const results = [];
    for (const reading of readings) {
      const result = await this.syncReading(machineId, reading);
      results.push(result);
    }
    return results;
  }
}

// Export singleton instance
export const firebaseSyncService = new FirebaseSyncService();







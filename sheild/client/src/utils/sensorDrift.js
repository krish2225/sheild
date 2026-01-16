/**
 * Sensor Drift / Stuck Sensor Detection Utility
 * Detects sensors that are stuck or not changing
 */

// Constants
const MIN_HISTORY_LENGTH = 10 // Need at least 10 readings
const VARIANCE_THRESHOLD = 0.01 // Minimum variance to consider sensor active
const STUCK_THRESHOLD = 0.001 // Very low variance = stuck

/**
 * Check if a sensor is stuck based on recent history
 * @param {string} sensorKey - Sensor key (temp_mean, vib_rms, current_rms)
 * @param {array} history - Array of recent sensor readings
 * @returns {object} { isStuck: boolean, reason: string, variance: number }
 */
export function checkSensorDrift(sensorKey, history) {
  if (!history || history.length < MIN_HISTORY_LENGTH) {
    return {
      isStuck: false,
      reason: 'Insufficient data',
      variance: null
    }
  }

  // Extract values for this sensor
  const values = history
    .slice(-MIN_HISTORY_LENGTH) // Last 10 readings
    .map(reading => {
      if (reading.features && reading.features[sensorKey] !== undefined) {
        return reading.features[sensorKey]
      }
      return reading[sensorKey]
    })
    .filter(v => v !== undefined && v !== null && !isNaN(v))

  if (values.length < MIN_HISTORY_LENGTH) {
    return {
      isStuck: false,
      reason: 'Insufficient valid readings',
      variance: null
    }
  }

  // Calculate variance
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  // Check if variance is too low (sensor stuck)
  if (variance < STUCK_THRESHOLD) {
    return {
      isStuck: true,
      reason: `Sensor value constant (variance: ${variance.toFixed(6)})`,
      variance: variance,
      mean: mean
    }
  }

  // Check if variance is very low (possible drift)
  if (variance < VARIANCE_THRESHOLD) {
    return {
      isStuck: false,
      reason: `Low variance detected (possible drift)`,
      variance: variance,
      mean: mean,
      warning: true
    }
  }

  return {
    isStuck: false,
    reason: 'Sensor is active',
    variance: variance,
    mean: mean
  }
}

/**
 * Get sensor drift status for all sensors
 * @param {array} history - Recent sensor readings
 * @returns {object} Status for each sensor
 */
export function checkAllSensors(history) {
  const sensors = ['temp_mean', 'vib_rms', 'current_rms']
  const results = {}

  sensors.forEach(sensor => {
    results[sensor] = checkSensorDrift(sensor, history)
  })

  return results
}

/**
 * Get sensor label from key
 * @param {string} sensorKey - Sensor key
 * @returns {string} Human-readable label
 */
export function getSensorLabel(sensorKey) {
  const labels = {
    temp_mean: 'Temperature',
    vib_rms: 'Vibration',
    current_rms: 'Current'
  }
  return labels[sensorKey] || sensorKey
}







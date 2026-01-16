/**
 * Threshold configuration for device features
 * 
 * These thresholds are used to generate warnings and alerts
 * when feature values exceed safe operating limits.
 */

export const DEFAULT_THRESHOLDS = {
  temp_mean: 60,      // Temperature threshold in Celsius
  vib_rms: 2.0,      // Vibration RMS threshold
  current_rms: 5.0   // Current RMS threshold in Amperes
}

/**
 * Get threshold for a specific feature
 * @param {string} featureName - Name of the feature
 * @returns {number} Threshold value
 */
export const getThreshold = (featureName) => {
  return DEFAULT_THRESHOLDS[featureName] || null
}

/**
 * Get all thresholds
 * @returns {object} Object with all threshold values
 */
export const getAllThresholds = () => {
  return { ...DEFAULT_THRESHOLDS }
}

/**
 * Update threshold for a feature
 * Note: In production, this should persist to backend/database
 * @param {string} featureName - Name of the feature
 * @param {number} value - New threshold value
 */
export const updateThreshold = (featureName, value) => {
  if (DEFAULT_THRESHOLDS.hasOwnProperty(featureName)) {
    DEFAULT_THRESHOLDS[featureName] = value
    // TODO: Persist to backend when available
    console.log(`Threshold updated: ${featureName} = ${value}`)
  }
}









/**
 * TEMPORARY PREDICTIVE LOGIC
 * 
 * This module contains temporary logic for deriving health status
 * from edge_health and feature thresholds.
 * 
 * TODO: Replace with ML model integration when backend ML is ready.
 */

/**
 * Get health status based on edge_health value
 * @param {number} edgeHealth - Health score from 0-100
 * @returns {object} Status object with label, color, and severity
 */
export const getHealthStatus = (edgeHealth) => {
  if (edgeHealth >= 80 && edgeHealth <= 100) {
    return {
      label: 'Healthy',
      color: 'green',
      severity: 'low',
      description: 'Machine operating within normal parameters'
    }
  } else if (edgeHealth >= 50 && edgeHealth < 80) {
    return {
      label: 'Degrading',
      color: 'yellow',
      severity: 'medium',
      description: 'Machine showing signs of degradation. Monitor closely.'
    }
  } else if (edgeHealth < 50) {
    return {
      label: 'Critical',
      color: 'red',
      severity: 'high',
      description: 'Machine requires immediate attention'
    }
  } else {
    return {
      label: 'Unknown',
      color: 'gray',
      severity: 'low',
      description: 'Status cannot be determined'
    }
  }
}

/**
 * Check if a feature value exceeds threshold and generate warning
 * @param {string} featureName - Name of the feature (temp_mean, vib_rms, current_rms)
 * @param {number} value - Current feature value
 * @param {number} threshold - Threshold value
 * @returns {object|null} Warning object or null if no warning
 */
export const checkFeatureThreshold = (featureName, value, threshold) => {
  if (value > threshold) {
    const featureLabels = {
      temp_mean: 'Temperature',
      vib_rms: 'Vibration',
      current_rms: 'Electrical Load'
    }

    return {
      feature: featureName,
      label: featureLabels[featureName] || featureName,
      value,
      threshold,
      severity: value > threshold * 1.5 ? 'high' : 'medium',
      message: `${featureLabels[featureName] || featureName} exceeds threshold (${value.toFixed(2)} > ${threshold})`
    }
  }
  return null
}

/**
 * Generate all warnings for device features
 * @param {object} features - Features object with temp_mean, vib_rms, current_rms
 * @param {object} thresholds - Thresholds object
 * @returns {array} Array of warning objects
 */
export const generateFeatureWarnings = (features, thresholds) => {
  const warnings = []
  
  if (features.temp_mean !== undefined && thresholds.temp_mean) {
    const warning = checkFeatureThreshold('temp_mean', features.temp_mean, thresholds.temp_mean)
    if (warning) warnings.push(warning)
  }
  
  if (features.vib_rms !== undefined && thresholds.vib_rms) {
    const warning = checkFeatureThreshold('vib_rms', features.vib_rms, thresholds.vib_rms)
    if (warning) warnings.push(warning)
  }
  
  if (features.current_rms !== undefined && thresholds.current_rms) {
    const warning = checkFeatureThreshold('current_rms', features.current_rms, thresholds.current_rms)
    if (warning) warnings.push(warning)
  }
  
  return warnings
}

/**
 * Format timestamp to readable date/time string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date/time string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const date = new Date(timestamp * 1000) // Convert to milliseconds
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Get time ago string from timestamp
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Time ago string (e.g., "2 minutes ago")
 */
export const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 60) return `${diff} second${diff !== 1 ? 's' : ''} ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) !== 1 ? 's' : ''} ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) !== 1 ? 's' : ''} ago`
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) !== 1 ? 's' : ''} ago`
}









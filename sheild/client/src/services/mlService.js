import { api } from '../lib/api'

/**
 * Get ML prediction for device features
 * @param {string} deviceId - Device ID
 * @param {object} features - Sensor features { temp_mean, vib_rms, current_rms, edge_health }
 * @returns {Promise<object>} ML prediction with anomaly, health_score, status, rul_hours
 */
export async function getMLPrediction(deviceId, features) {
  try {
    const response = await api.post('/predict/predict', {
      device_id: deviceId,
      features
    })
    
    if (response.data.success && response.data.data.prediction) {
      return response.data.data.prediction
    }
    
    return null
  } catch (error) {
    console.error('ML prediction error:', error)
    return null
  }
}

/**
 * Format RUL hours to human-readable string
 * @param {number} hours - RUL in hours
 * @returns {string} Formatted RUL string
 */
export function formatRUL(hours) {
  if (!hours || hours <= 0) return 'N/A'
  
  if (hours < 24) {
    return `${Math.round(hours)} hours`
  } else if (hours < 168) {
    const days = Math.floor(hours / 24)
    const remainingHours = Math.round(hours % 24)
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`
  } else {
    const weeks = Math.floor(hours / 168)
    const remainingDays = Math.floor((hours % 168) / 24)
    return remainingDays > 0 ? `${weeks}w ${remainingDays}d` : `${weeks} weeks`
  }
}







/**
 * Data Quality Indicator Utility
 * Determines if incoming sensor data is reliable
 */

// Constants
const STALE_THRESHOLD_MS = 10000 // 10 seconds
const SPIKE_MULTIPLIER = 3 // 3x moving average indicates spike

/**
 * Calculate data quality status
 * @param {object} currentData - Current sensor reading
 * @param {array} recentHistory - Array of recent readings (for moving average)
 * @returns {object} { status: 'good' | 'degraded', reason: string }
 */
export function checkDataQuality(currentData, recentHistory = []) {
  if (!currentData) {
    return {
      status: 'degraded',
      reason: 'No data available'
    }
  }

  // Check timestamp staleness
  const now = Date.now()
  const dataTimestamp = currentData.timestamp ? (typeof currentData.timestamp === 'number' ? currentData.timestamp * 1000 : new Date(currentData.timestamp).getTime()) : null
  
  if (!dataTimestamp) {
    return {
      status: 'degraded',
      reason: 'Missing timestamp'
    }
  }

  const ageMs = now - dataTimestamp
  if (ageMs > STALE_THRESHOLD_MS) {
    return {
      status: 'degraded',
      reason: `Data is ${Math.round(ageMs / 1000)}s old (stale)`
    }
  }

  // Check for missing features
  const features = currentData.features || {}
  const requiredFeatures = ['temp_mean', 'vib_rms', 'current_rms']
  const missingFeatures = requiredFeatures.filter(f => 
    features[f] === undefined || features[f] === null
  )

  if (missingFeatures.length > 0) {
    return {
      status: 'degraded',
      reason: `Missing features: ${missingFeatures.join(', ')}`
    }
  }

  // Check for sudden spikes (if we have history)
  if (recentHistory.length >= 5) {
    const spikeDetected = checkForSpikes(features, recentHistory)
    if (spikeDetected) {
      return {
        status: 'degraded',
        reason: spikeDetected
      }
    }
  }

  // All checks passed
  return {
    status: 'good',
    reason: 'Data is fresh and complete'
  }
}

/**
 * Check for sudden spikes in sensor values
 * @param {object} currentFeatures - Current feature values
 * @param {array} history - Recent historical readings
 * @returns {string|null} Reason if spike detected, null otherwise
 */
function checkForSpikes(currentFeatures, history) {
  const features = ['temp_mean', 'vib_rms', 'current_rms']
  
  for (const feature of features) {
    const currentValue = currentFeatures[feature]
    if (currentValue === undefined || currentValue === null) continue

    // Calculate moving average from history
    const values = history
      .map(h => h.features?.[feature])
      .filter(v => v !== undefined && v !== null)
      .slice(-10) // Last 10 values

    if (values.length < 5) continue

    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    
    // Check if current value is a spike
    if (avg > 0 && Math.abs(currentValue) > Math.abs(avg) * SPIKE_MULTIPLIER) {
      const change = ((currentValue - avg) / avg * 100).toFixed(1)
      return `Sudden spike in ${feature.replace('_', ' ')}: ${change}% increase`
    }
  }

  return null
}

/**
 * Get quality badge color class
 * @param {string} status - 'good' | 'degraded'
 * @returns {string} Tailwind CSS classes
 */
export function getQualityBadgeColor(status) {
  return status === 'good' 
    ? 'bg-green-900 text-green-200 border-green-500' 
    : 'bg-yellow-900 text-yellow-200 border-yellow-500'
}







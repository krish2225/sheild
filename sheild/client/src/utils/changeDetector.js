/**
 * Change Detector Utility
 * Explains what changed between readings in simple language
 */

// Constants
const SIGNIFICANT_CHANGE_THRESHOLD = 0.1 // 10% change is significant
const LARGE_CHANGE_THRESHOLD = 0.25 // 25% change is large

/**
 * Detect significant changes between current and previous reading
 * @param {object} currentData - Current sensor reading
 * @param {object} previousData - Previous sensor reading
 * @returns {array} Array of change descriptions
 */
export function detectChanges(currentData, previousData) {
  if (!currentData || !previousData) {
    return []
  }

  const changes = []
  const currentFeatures = currentData.features || {}
  const previousFeatures = previousData.features || {}
  const currentHealth = currentData.edge_health || 0
  const previousHealth = previousData.edge_health || 0

  // Check temperature change
  if (currentFeatures.temp_mean !== undefined && previousFeatures.temp_mean !== undefined) {
    const change = calculateChange(currentFeatures.temp_mean, previousFeatures.temp_mean)
    if (Math.abs(change.percent) >= SIGNIFICANT_CHANGE_THRESHOLD * 100) {
      changes.push({
        type: 'temperature',
        direction: change.direction,
        magnitude: change.magnitude,
        percent: change.percent,
        value: currentFeatures.temp_mean,
        previous: previousFeatures.temp_mean
      })
    }
  }

  // Check vibration change
  if (currentFeatures.vib_rms !== undefined && previousFeatures.vib_rms !== undefined) {
    const change = calculateChange(currentFeatures.vib_rms, previousFeatures.vib_rms)
    if (Math.abs(change.percent) >= SIGNIFICANT_CHANGE_THRESHOLD * 100) {
      changes.push({
        type: 'vibration',
        direction: change.direction,
        magnitude: change.magnitude,
        percent: change.percent,
        value: currentFeatures.vib_rms,
        previous: previousFeatures.vib_rms
      })
    }
  }

  // Check current change
  if (currentFeatures.current_rms !== undefined && previousFeatures.current_rms !== undefined) {
    const change = calculateChange(currentFeatures.current_rms, previousFeatures.current_rms)
    if (Math.abs(change.percent) >= SIGNIFICANT_CHANGE_THRESHOLD * 100) {
      changes.push({
        type: 'current',
        direction: change.direction,
        magnitude: change.magnitude,
        percent: change.percent,
        value: currentFeatures.current_rms,
        previous: previousFeatures.current_rms
      })
    }
  }

  // Check health score change
  if (currentHealth !== undefined && previousHealth !== undefined) {
    const change = calculateChange(currentHealth, previousHealth)
    if (Math.abs(change.percent) >= SIGNIFICANT_CHANGE_THRESHOLD * 100) {
      changes.push({
        type: 'health',
        direction: change.direction,
        magnitude: change.magnitude,
        percent: change.percent,
        value: currentHealth,
        previous: previousHealth
      })
    }
  }

  return changes
}

/**
 * Calculate change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {object} Change details
 */
function calculateChange(current, previous) {
  if (previous === 0) {
    return {
      direction: current > 0 ? 'up' : 'down',
      magnitude: Math.abs(current),
      percent: current > 0 ? 100 : -100
    }
  }

  const diff = current - previous
  const percent = (diff / Math.abs(previous)) * 100

  return {
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
    magnitude: Math.abs(diff),
    percent: percent
  }
}

/**
 * Format change description for display
 * @param {object} change - Change object from detectChanges
 * @returns {string} Human-readable description
 */
export function formatChange(change) {
  const labels = {
    temperature: 'Temperature',
    vibration: 'Vibration',
    current: 'Current',
    health: 'Health Score'
  }

  const label = labels[change.type] || change.type
  const arrow = change.direction === 'up' ? '↑' : change.direction === 'down' ? '↓' : '→'
  const magnitude = change.magnitude.toFixed(2)
  const percent = Math.abs(change.percent).toFixed(1)
  
  const magnitudeText = change.type === 'health' 
    ? `${magnitude} points`
    : change.type === 'temperature'
    ? `${magnitude}°C`
    : change.type === 'vibration'
    ? `${magnitude} m/s²`
    : `${magnitude} A`

  return `${arrow} ${label}: ${magnitudeText} (${percent}%)`
}

/**
 * Get change severity color
 * @param {object} change - Change object
 * @returns {string} Tailwind CSS color class
 */
export function getChangeColor(change) {
  const absPercent = Math.abs(change.percent)
  
  if (change.type === 'health' && change.direction === 'down') {
    // Health drops are always concerning
    if (absPercent >= LARGE_CHANGE_THRESHOLD * 100) return 'text-red-400'
    return 'text-yellow-400'
  }

  if (absPercent >= LARGE_CHANGE_THRESHOLD * 100) {
    return change.direction === 'up' ? 'text-yellow-400' : 'text-cyan-400'
  }

  return 'text-slate-300'
}







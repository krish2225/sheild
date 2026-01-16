/**
 * Failure Prediction Utility
 * Analyzes sensor readings to predict component failures and malfunctions
 */

// Component failure thresholds and patterns
const FAILURE_PATTERNS = {
  bearing: {
    name: 'Bearing Failure',
    indicators: [
      { feature: 'vib_rms', threshold: 2.0, weight: 0.4 },
      { feature: 'temp_mean', threshold: 70, weight: 0.3 },
      { feature: 'current_rms', threshold: 3.5, weight: 0.2 },
      { feature: 'edge_health', threshold: 60, weight: 0.1 }
    ],
    symptoms: ['Increased vibration', 'Rising temperature', 'Abnormal noise'],
    severity: 'high'
  },
  motor_winding: {
    name: 'Motor Winding Failure',
    indicators: [
      { feature: 'current_rms', threshold: 4.0, weight: 0.5 },
      { feature: 'temp_mean', threshold: 75, weight: 0.3 },
      { feature: 'edge_health', threshold: 50, weight: 0.2 }
    ],
    symptoms: ['High current draw', 'Overheating', 'Reduced efficiency'],
    severity: 'high'
  },
  misalignment: {
    name: 'Shaft Misalignment',
    indicators: [
      { feature: 'vib_rms', threshold: 1.8, weight: 0.6 },
      { feature: 'temp_mean', threshold: 65, weight: 0.2 },
      { feature: 'edge_health', threshold: 70, weight: 0.2 }
    ],
    symptoms: ['Excessive vibration', 'Premature bearing wear', 'Increased energy consumption'],
    severity: 'medium'
  },
  imbalance: {
    name: 'Rotor Imbalance',
    indicators: [
      { feature: 'vib_rms', threshold: 1.5, weight: 0.7 },
      { feature: 'edge_health', threshold: 75, weight: 0.3 }
    ],
    symptoms: ['High vibration levels', 'Reduced machine life', 'Increased noise'],
    severity: 'medium'
  },
  electrical_fault: {
    name: 'Electrical Fault',
    indicators: [
      { feature: 'current_rms', threshold: 3.8, weight: 0.6 },
      { feature: 'temp_mean', threshold: 70, weight: 0.2 },
      { feature: 'edge_health', threshold: 55, weight: 0.2 }
    ],
    symptoms: ['Irregular current patterns', 'Overheating', 'Power fluctuations'],
    severity: 'high'
  },
  lubrication: {
    name: 'Lubrication Issues',
    indicators: [
      { feature: 'temp_mean', threshold: 68, weight: 0.5 },
      { feature: 'vib_rms', threshold: 1.6, weight: 0.3 },
      { feature: 'edge_health', threshold: 65, weight: 0.2 }
    ],
    symptoms: ['Increased friction', 'Rising temperature', 'Bearing wear'],
    severity: 'medium'
  },
  coupling: {
    name: 'Coupling Failure',
    indicators: [
      { feature: 'vib_rms', threshold: 1.7, weight: 0.5 },
      { feature: 'current_rms', threshold: 3.2, weight: 0.3 },
      { feature: 'edge_health', threshold: 68, weight: 0.2 }
    ],
    symptoms: ['Vibration spikes', 'Torque transmission issues', 'Mechanical stress'],
    severity: 'medium'
  }
}

/**
 * Calculate failure probability for a component based on sensor readings
 * @param {object} pattern - Failure pattern definition
 * @param {object} readings - Current sensor readings
 * @returns {number} Probability score (0-100)
 */
function calculateFailureProbability(pattern, readings) {
  let totalScore = 0
  let totalWeight = 0

  pattern.indicators.forEach(indicator => {
    const value = readings[indicator.feature]
    if (value !== undefined && value !== null) {
      // Calculate how much the value exceeds the threshold
      const excess = Math.max(0, value - indicator.threshold)
      // Normalize to 0-1 scale (assuming reasonable max values)
      const maxValues = {
        temp_mean: 100,
        vib_rms: 5,
        current_rms: 6,
        edge_health: 100
      }
      // More sensitive calculation - even small excesses contribute
      const range = maxValues[indicator.feature] - indicator.threshold
      const normalized = range > 0 ? Math.min(1, excess / range) : (excess > 0 ? 1 : 0)
      // Boost score if value exceeds threshold significantly
      const boost = excess > 0 ? 1.5 : 1
      totalScore += normalized * indicator.weight * boost
      totalWeight += indicator.weight
    }
  })

  // Also consider health score inversely (lower health = higher failure risk)
  if (readings.edge_health !== undefined) {
    const healthFactor = (100 - readings.edge_health) / 100
    totalScore += healthFactor * 0.3 // Increased weight
    totalWeight += 0.3
  }

  // Normalize to 0-100, with minimum boost if any indicator is active
  const hasActiveIndicator = pattern.indicators.some(ind => {
    const value = readings[ind.feature]
    return value !== undefined && value !== null && value > ind.threshold
  })
  
  let probability = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0
  
  // Boost probability if any indicator is active (ensures alerts appear)
  if (hasActiveIndicator && probability < 25) {
    probability = Math.max(25, probability * 1.5)
  }
  
  return Math.min(100, Math.max(0, probability))
}

/**
 * Predict component failures based on sensor readings
 * @param {object} readings - Current sensor readings
 * @param {object} anomalyData - Optional anomaly detection data
 * @returns {array} Array of predicted failures sorted by probability
 */
export function predictFailures(readings, anomalyData = null) {
  if (!readings) {
    return []
  }

  // Handle both direct readings and readings with features object
  const features = readings.features || {}
  const sensorData = {
    temp_mean: features.temp_mean || readings.temp_mean || 0,
    vib_rms: features.vib_rms || readings.vib_rms || 0,
    current_rms: features.current_rms || readings.current_rms || 0,
    edge_health: readings.edge_health || 100
  }
  

  // Calculate failure probability for each component
  const predictions = Object.entries(FAILURE_PATTERNS).map(([key, pattern]) => {
    const probability = calculateFailureProbability(pattern, sensorData)
    
    return {
      id: key,
      component: pattern.name,
      probability: Math.round(probability),
      severity: pattern.severity,
      symptoms: pattern.symptoms,
      riskLevel: getRiskLevel(probability),
      indicators: getActiveIndicators(pattern, sensorData)
    }
  })

  // Filter out very low probability predictions (< 20%) and sort by probability
  // Show predictions that have at least one active indicator or probability >= 20%
  const filtered = predictions.filter(p => {
    // Show if probability is high enough
    if (p.probability >= 20) return true
    // Show if there are active indicators (even with lower probability)
    if (p.indicators && p.indicators.length > 0) return true
    return false
  })
  
  return filtered.sort((a, b) => b.probability - a.probability)
}

/**
 * Get risk level based on probability
 * @param {number} probability - Failure probability (0-100)
 * @returns {string} Risk level
 */
function getRiskLevel(probability) {
  if (probability >= 70) return 'critical'
  if (probability >= 50) return 'high'
  if (probability >= 30) return 'medium'
  return 'low'
}

/**
 * Get active indicators for a component
 * @param {object} pattern - Failure pattern
 * @param {object} readings - Sensor readings
 * @returns {array} Active indicators
 */
function getActiveIndicators(pattern, readings) {
  return pattern.indicators
    .filter(indicator => {
      const value = readings[indicator.feature]
      return value !== undefined && value !== null && value > indicator.threshold
    })
    .map(indicator => ({
      feature: indicator.feature,
      value: readings[indicator.feature],
      threshold: indicator.threshold
    }))
}

/**
 * Get risk level color class
 * @param {string} riskLevel - Risk level
 * @returns {string} Tailwind CSS classes
 */
export function getRiskLevelColor(riskLevel) {
  switch (riskLevel) {
    case 'critical':
      return 'bg-red-900 text-red-200 border-red-500'
    case 'high':
      return 'bg-orange-900 text-orange-200 border-orange-500'
    case 'medium':
      return 'bg-yellow-900 text-yellow-200 border-yellow-500'
    case 'low':
      return 'bg-blue-900 text-blue-200 border-blue-500'
    default:
      return 'bg-slate-700 text-slate-300 border-slate-600'
  }
}

/**
 * Get severity color class
 * @param {string} severity - Severity level
 * @returns {string} Tailwind CSS classes
 */
export function getSeverityColor(severity) {
  switch (severity) {
    case 'high':
      return 'text-red-400'
    case 'medium':
      return 'text-yellow-400'
    case 'low':
      return 'text-blue-400'
    default:
      return 'text-slate-400'
  }
}

/**
 * Format feature name for display
 * @param {string} feature - Feature key
 * @returns {string} Formatted name
 */
export function formatFeatureName(feature) {
  const names = {
    temp_mean: 'Temperature',
    vib_rms: 'Vibration',
    current_rms: 'Current',
    edge_health: 'Health Score'
  }
  return names[feature] || feature
}


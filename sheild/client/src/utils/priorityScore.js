/**
 * Maintenance Priority Score Utility
 * Calculates priority level for maintenance actions
 */

// Constants
const WEIGHTS = {
  health_score: 0.4,
  anomaly_score: 0.4,
  rul_hours: 0.2
}

const PRIORITY_THRESHOLDS = {
  high: 0.7,    // Score >= 0.7 = HIGH priority
  medium: 0.4, // Score >= 0.4 = MEDIUM priority
  low: 0.0     // Score < 0.4 = LOW priority
}

/**
 * Calculate maintenance priority score
 * @param {object} params - Priority calculation parameters
 * @param {number} params.health_score - Health score (0-100)
 * @param {number} params.anomaly_score - Anomaly score (0-1)
 * @param {number} params.rul_hours - Remaining Useful Life in hours
 * @returns {object} { priority: 'LOW' | 'MEDIUM' | 'HIGH', score: number, factors: object }
 */
export function calculatePriorityScore({ health_score = 100, anomaly_score = 0, rul_hours = 1000 }) {
  // Normalize health score (invert: lower health = higher priority)
  const normalizedHealth = 1 - (health_score / 100)
  
  // Normalize anomaly score (already 0-1, higher = higher priority)
  const normalizedAnomaly = anomaly_score
  
  // Normalize RUL (invert: lower RUL = higher priority)
  // RUL ranges from 1-1000 hours, normalize to 0-1
  const normalizedRUL = 1 - Math.min(1, Math.max(0, (rul_hours - 1) / 999))
  
  // Calculate weighted score
  const score = (
    normalizedHealth * WEIGHTS.health_score +
    normalizedAnomaly * WEIGHTS.anomaly_score +
    normalizedRUL * WEIGHTS.rul_hours
  )

  // Determine priority level
  let priority = 'LOW'
  if (score >= PRIORITY_THRESHOLDS.high) {
    priority = 'HIGH'
  } else if (score >= PRIORITY_THRESHOLDS.medium) {
    priority = 'MEDIUM'
  }

  return {
    priority,
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    factors: {
      health_contribution: normalizedHealth * WEIGHTS.health_score,
      anomaly_contribution: normalizedAnomaly * WEIGHTS.anomaly_score,
      rul_contribution: normalizedRUL * WEIGHTS.rul_hours
    }
  }
}

/**
 * Get priority badge color classes
 * @param {string} priority - 'LOW' | 'MEDIUM' | 'HIGH'
 * @returns {string} Tailwind CSS classes
 */
export function getPriorityBadgeColor(priority) {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-900 text-red-200 border-red-500'
    case 'MEDIUM':
      return 'bg-yellow-900 text-yellow-200 border-yellow-500'
    case 'LOW':
      return 'bg-green-900 text-green-200 border-green-500'
    default:
      return 'bg-slate-700 text-slate-300 border-slate-600'
  }
}

/**
 * Get priority description
 * @param {string} priority - Priority level
 * @returns {string} Human-readable description
 */
export function getPriorityDescription(priority) {
  switch (priority) {
    case 'HIGH':
      return 'Immediate attention required'
    case 'MEDIUM':
      return 'Schedule maintenance soon'
    case 'LOW':
      return 'Monitor and plan maintenance'
    default:
      return 'Unknown priority'
  }
}







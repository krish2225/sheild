import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { predictFailures, getRiskLevelColor, getSeverityColor, formatFeatureName } from '../utils/failurePrediction'

/**
 * FailurePredictionPanel component
 * Displays predicted component failures based on sensor readings
 * @param {object} deviceData - Current device sensor data
 * @param {object} mlPrediction - ML prediction data (optional)
 */
export default function FailurePredictionPanel({ deviceData, mlPrediction }) {
  const panelRef = useRef(null)
  const predictions = deviceData ? predictFailures(deviceData, mlPrediction) : []

  useEffect(() => {
    if (panelRef.current && predictions.length > 0) {
      gsap.fromTo(panelRef.current.children, {
        opacity: 0,
        y: 10
      }, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out'
      })
    }
  }, [predictions.length])

  if (!deviceData || predictions.length === 0) {
    return (
      <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Failure Prediction</h2>
        <div className="text-slate-400 text-center py-8">
          <div className="text-sm">No component failures predicted at this time.</div>
          <div className="text-xs mt-2 text-slate-500">All systems operating within normal parameters.</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={panelRef} className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-200">Failure Prediction</h2>
        <div className="text-xs text-slate-400">
          {predictions.length} {predictions.length === 1 ? 'component' : 'components'} at risk
        </div>
      </div>

      <div className="space-y-4">
        {predictions.map((prediction) => (
          <div
            key={prediction.id}
            className="bg-slate-800 border-2 border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
          >
            {/* Component Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-white">{prediction.component}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border ${getRiskLevelColor(prediction.riskLevel)}`}
                  >
                    {prediction.riskLevel.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Failure Probability:</span>
                    <span className={`text-lg font-bold ${
                      prediction.probability >= 70 ? 'text-red-400' :
                      prediction.probability >= 50 ? 'text-orange-400' :
                      prediction.probability >= 30 ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {prediction.probability}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Severity:</span>
                    <span className={`text-sm font-medium ${getSeverityColor(prediction.severity)}`}>
                      {prediction.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Probability Bar */}
            <div className="mb-3">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    prediction.probability >= 70 ? 'bg-red-500' :
                    prediction.probability >= 50 ? 'bg-orange-500' :
                    prediction.probability >= 30 ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${prediction.probability}%` }}
                />
              </div>
            </div>

            {/* Active Indicators */}
            {prediction.indicators.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-slate-400 mb-2">Active Indicators:</div>
                <div className="flex flex-wrap gap-2">
                  {prediction.indicators.map((indicator, idx) => (
                    <div
                      key={idx}
                      className="text-xs px-2 py-1 bg-slate-700 rounded border border-slate-600"
                    >
                      <span className="text-slate-300">{formatFeatureName(indicator.feature)}:</span>
                      <span className="text-yellow-400 ml-1">
                        {indicator.value.toFixed(2)} (threshold: {indicator.threshold})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Symptoms */}
            <div>
              <div className="text-xs text-slate-400 mb-2">Potential Symptoms:</div>
              <ul className="list-disc list-inside space-y-1">
                {prediction.symptoms.map((symptom, idx) => (
                  <li key={idx} className="text-sm text-slate-300">
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Recommended Actions:</div>
              <div className="text-sm text-cyan-300">
                {prediction.probability >= 70
                  ? '⚠️ Immediate inspection and maintenance required'
                  : prediction.probability >= 50
                  ? '🔧 Schedule maintenance within 24-48 hours'
                  : '📋 Monitor closely and plan preventive maintenance'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {predictions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            <strong className="text-slate-200">Analysis:</strong> Based on current sensor readings,{' '}
            {predictions.length === 1
              ? '1 component shows signs of potential failure'
              : `${predictions.length} components show signs of potential failure`}
            . Review each component above for detailed risk assessment.
          </div>
        </div>
      )}
    </div>
  )
}







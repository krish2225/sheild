import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { subscribeToDeviceData } from '../services/firebase'
import { getHealthStatus, generateFeatureWarnings, formatTimestamp } from '../services/statusLogic'
import { getAllThresholds, updateThreshold } from '../services/thresholds'
import AlertTable from '../components/AlertTable'

export default function Alerts() {
  const [deviceData, setDeviceData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [thresholds, setThresholds] = useState(getAllThresholds())
  const [editingThreshold, setEditingThreshold] = useState(null)
  const containerRef = useRef(null)
  const thresholdRef = useRef(null)
  const statusRef = useRef(null)

  useEffect(() => {
    let unsubscribe = null

    const setupSubscription = () => {
      unsubscribe = subscribeToDeviceData('PM_001', (data) => {
        if (data) {
          setDeviceData(data)

          // Generate alerts based on current data
          const currentThresholds = getAllThresholds()
          const warnings = generateFeatureWarnings(data.features || {}, currentThresholds)
          const healthStatus = getHealthStatus(data.edge_health || 0)

          const newAlerts = []

          // Feature warnings
          warnings.forEach((warning, index) => {
            newAlerts.push({
              id: `warning-${data.timestamp}-${index}`,
              message: warning.message,
              severity: warning.severity,
              timestamp: data.timestamp * 1000,
              type: 'feature_warning',
              feature: warning.feature
            })
          })

          // Health status alerts
          if (healthStatus.severity === 'high') {
            newAlerts.push({
              id: `health-${data.timestamp}`,
              message: `Machine health is ${healthStatus.label.toLowerCase()}. Immediate attention required.`,
              severity: 'high',
              timestamp: data.timestamp * 1000,
              type: 'health_status'
            })
          } else if (healthStatus.severity === 'medium') {
            newAlerts.push({
              id: `health-${data.timestamp}`,
              message: `Machine health is ${healthStatus.label.toLowerCase()}. Monitor closely.`,
              severity: 'medium',
              timestamp: data.timestamp * 1000,
              type: 'health_status'
            })
          }

          setAlerts(prev => {
            // Merge new alerts, avoiding duplicates
            const existingIds = new Set(prev.map(a => a.id))
            const uniqueNewAlerts = newAlerts.filter(a => !existingIds.has(a.id))
            return [...prev, ...uniqueNewAlerts]
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 100) // Keep last 100 alerts
          })
        }
      })
    }

    setupSubscription()

    return () => {
      if (unsubscribe) {
        unsubscribe()
    }
  }
  }, [])

  // GSAP animations - only run once on initial load
  const hasAnimatedRef = useRef(false)
  useEffect(() => {
    if (hasAnimatedRef.current) return

    hasAnimatedRef.current = true

    const ctx = gsap.context(() => {
      if (thresholdRef.current) {
        gsap.fromTo(thresholdRef.current, {
          opacity: 0,
          y: 20
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        })
      }

      if (statusRef.current) {
        gsap.fromTo(statusRef.current, {
          opacity: 0,
          y: 20
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2,
          ease: 'power2.out'
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleThresholdUpdate = (featureName, value) => {
    updateThreshold(featureName, parseFloat(value))
    setThresholds(getAllThresholds())
    setEditingThreshold(null)
  }

  const handleAcknowledge = (alertId) => {
    // In production, this would call backend API
    console.log('Alert acknowledged:', alertId)
  }

  return (
    <div ref={containerRef} className="p-8 space-y-8">
      {/* Threshold Configuration */}
      <div ref={thresholdRef} className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">Alert Thresholds</h2>
        <p className="text-sm text-white mb-6">
          Configure thresholds for sensor readings. Alerts will be generated when values exceed these limits.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(thresholds).map(([feature, value]) => (
            <div key={feature} className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white capitalize">
                  {feature.replace('_', ' ')}
                </label>
                {editingThreshold === feature ? (
                  <button
                    onClick={() => setEditingThreshold(null)}
                    className="text-xs text-slate-400 hover:text-slate-300"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingThreshold(feature)}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Edit
                  </button>
                )}
          </div>
              {editingThreshold === feature ? (
                <div className="flex gap-2">
            <input 
              type="number" 
                    step="0.1"
                    defaultValue={value}
                    onBlur={(e) => handleThresholdUpdate(feature, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleThresholdUpdate(feature, e.target.value)
                      }
                    }}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold text-white">{value}</div>
              )}
              {deviceData && deviceData.features && (
                <div className="text-xs text-slate-400 mt-2">
                  Current: {deviceData.features[feature]?.toFixed(2) || 'N/A'}
                  {deviceData.features[feature] > value && (
                    <span className="text-yellow-400 ml-2">⚠ Exceeded</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Device Status */}
      {deviceData && (
        <div ref={statusRef} className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Current Device Status</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-slate-300 mb-1 font-medium">Health Score</div>
              <div className="text-2xl font-bold text-cyan-300">{deviceData.edge_health || 0}%</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Temperature</div>
              <div className="text-lg font-semibold text-slate-200">
                {deviceData.features?.temp_mean?.toFixed(2) || 'N/A'}°C
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Vibration</div>
              <div className="text-lg font-semibold text-slate-200">
                {deviceData.features?.vib_rms?.toFixed(2) || 'N/A'} m/s²
              </div>
          </div>
          <div>
              <div className="text-sm text-slate-400 mb-1">Current</div>
              <div className="text-lg font-semibold text-slate-200">
                {deviceData.features?.current_rms?.toFixed(2) || 'N/A'} A
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            Last updated: {formatTimestamp(deviceData.timestamp)}
          </div>
        </div>
      )}

      {/* Alerts Table */}
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Active Alerts</h2>
        <AlertTable alerts={alerts} onAcknowledge={handleAcknowledge} />
      </div>

      {/* Alert Generation Info */}
      <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4 shadow-lg">
        <div className="text-sm text-slate-400">
          <strong className="text-slate-300">Note:</strong> Alerts are automatically generated based on:
        </div>
        <ul className="text-sm text-slate-500 mt-2 ml-4 list-disc space-y-1">
          <li>Feature values exceeding configured thresholds</li>
          <li>Machine health status (edge_health) falling below safe levels</li>
          <li>Real-time data from device PM_001</li>
        </ul>
      </div>
    </div>
  )
}

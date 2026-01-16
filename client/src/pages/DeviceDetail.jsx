import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { useParams } from 'react-router-dom'
import { subscribeToDeviceData } from '../services/firebase'
import { getHealthStatus, formatTimestamp, getTimeAgo, generateFeatureWarnings } from '../services/statusLogic'
import { getAllThresholds } from '../services/thresholds'
import HealthBadge from '../components/HealthBadge'
import SensorCard from '../components/SensorCard'
import StatusIndicator from '../components/StatusIndicator'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function DeviceDetail() {
  const { deviceId = 'PM_001' } = useParams()
  const [deviceData, setDeviceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const healthGaugeRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    let unsubscribe = null

    const setupSubscription = () => {
      unsubscribe = subscribeToDeviceData(deviceId, (data, err) => {
        if (err) {
          setError(err.message || 'Failed to connect to Firebase')
          setLoading(false)
          return
        }

        if (data) {
          // Only update if data actually changed to prevent unnecessary re-renders
          setDeviceData(prev => {
            if (prev && prev.timestamp === data.timestamp) {
              return prev // Don't update if timestamp is the same
            }
            return data
          })
          setLoading(false)
          setError(null)

          // Add to history for charts (keep last 50 points)
          setHistory(prev => {
            // Check if this timestamp already exists to avoid duplicates
            if (prev.length > 0 && prev[prev.length - 1].timestamp === data.timestamp) {
              return prev // Don't add duplicate
            }
            const newHistory = [...prev, {
              timestamp: data.timestamp,
              time: formatTimestamp(data.timestamp),
              temp_mean: data.features?.temp_mean || 0,
              vib_rms: data.features?.vib_rms || 0,
              current_rms: data.features?.current_rms || 0,
              edge_health: data.edge_health || 0
            }]
            return newHistory.slice(-50) // Keep last 50 data points
          })
        } else {
          setLoading(false)
        }
      })
    }

    setupSubscription()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [deviceId])

  // GSAP animations - only run once on initial load
  const hasAnimatedRef = useRef(false)
  useEffect(() => {
    if (!deviceData || loading || hasAnimatedRef.current) return

    hasAnimatedRef.current = true

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current, {
          opacity: 0,
          y: -20
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        })
      }

      if (healthGaugeRef.current) {
        gsap.fromTo(healthGaugeRef.current, {
          opacity: 0,
          scale: 0.8,
          rotation: -10
        }, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'back.out(1.7)'
        })
      }

      if (cardsRef.current) {
        gsap.fromTo(cardsRef.current.children, {
          opacity: 0,
          y: 30
        }, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.4,
          ease: 'power2.out'
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [deviceData, loading])

  if (loading && !deviceData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading device data...</div>
      </div>
    )
  }

  if (error && !deviceData) {
    return (
      <div className="p-8">
        <div className="bg-red-900 border-2 border-red-500 rounded-lg p-6 text-red-200 shadow-lg">
          <div className="font-semibold mb-2">Connection Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )
  }

  if (!deviceData) {
    return (
      <div className="p-8">
        <div className="text-slate-400">No device data available</div>
      </div>
    )
  }

  const healthStatus = getHealthStatus(deviceData.edge_health || 0)
  const features = deviceData.features || {}
  const thresholds = getAllThresholds()
  const warnings = generateFeatureWarnings(features, thresholds)

  return (
    <div ref={containerRef} className="p-8 space-y-8">
      {/* Device Header */}
      <div ref={headerRef} className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{deviceData.device_id || deviceId}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Last updated: {formatTimestamp(deviceData.timestamp)} ({getTimeAgo(deviceData.timestamp)})
            </p>
          </div>
          <StatusIndicator healthScore={deviceData.edge_health} size="lg" />
        </div>
      </div>

      {/* Health Score Visualization */}
      <div className="grid md:grid-cols-2 gap-6">
        <div ref={healthGaugeRef} className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Health Score</h2>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - (deviceData.edge_health || 0) / 100)}`}
                  className={
                    healthStatus.color === 'green' ? 'text-green-400' :
                    healthStatus.color === 'yellow' ? 'text-yellow-400' :
                    healthStatus.color === 'red' ? 'text-red-400' :
                    'text-slate-400'
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    healthStatus.color === 'green' ? 'text-green-400' :
                    healthStatus.color === 'yellow' ? 'text-yellow-400' :
                    healthStatus.color === 'red' ? 'text-red-400' :
                    'text-slate-400'
                  }`}>
                    {deviceData.edge_health || 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <HealthBadge healthScore={deviceData.edge_health} deviceId={deviceId} />
            <p className="text-sm text-slate-400 mt-2">{healthStatus.description}</p>
          </div>
        </div>

        <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Predictive Status</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400 mb-2">Current Condition</div>
              <div className="text-lg font-semibold text-slate-200">{healthStatus.label}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-2">Status Severity</div>
              <div className={`inline-block px-3 py-1 rounded ${
                healthStatus.severity === 'high' ? 'bg-red-900 text-red-200' :
                healthStatus.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                'bg-green-900 text-green-200'
              }`}>
                {healthStatus.severity}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400 mb-2">Note</div>
              <div className="text-xs text-slate-500">
                This status is derived from edge_health and feature thresholds. 
                ML-based predictions will be integrated when the backend ML model is ready.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Real-time Features</h2>
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6">
          <SensorCard
            label="Temperature"
            value={features.temp_mean}
            unit="°C"
            featureKey="temp_mean"
          />
          <SensorCard
            label="Vibration"
            value={features.vib_rms}
            unit="m/s²"
            featureKey="vib_rms"
          />
          <SensorCard
            label="Current"
            value={features.current_rms}
            unit="A"
            featureKey="current_rms"
          />
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Active Warnings</h2>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="bg-yellow-900 border-2 border-yellow-500 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-yellow-400">{warning.label}</div>
                    <div className="text-sm text-slate-300 mt-1">{warning.message}</div>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    warning.severity === 'high' ? 'bg-red-900 text-red-200' :
                    'bg-yellow-900 text-yellow-200'
                  }`}>
                    {warning.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Chart */}
      {history.length > 0 && (
        <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Real-time Feature Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="temp_mean"
                stroke="#60a5fa"
                strokeWidth={2}
                name="Temperature (°C)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="vib_rms"
                stroke="#22d3ee"
                strokeWidth={2}
                name="Vibration (m/s²)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="current_rms"
                stroke="#34d399"
                strokeWidth={2}
                name="Current (A)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}


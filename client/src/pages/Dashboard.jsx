import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { subscribeToDeviceData } from '../services/firebase'
import { getHealthStatus, formatTimestamp, getTimeAgo, generateFeatureWarnings } from '../services/statusLogic'
import { getAllThresholds } from '../services/thresholds'
import HealthBadge from '../components/HealthBadge'
import SensorCard from '../components/SensorCard'
import StatusIndicator from '../components/StatusIndicator'
import AlertTable from '../components/AlertTable'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const [deviceData, setDeviceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [alerts, setAlerts] = useState([])
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const sensorCardsRef = useRef(null)
  const chartsRef = useRef(null)

  useEffect(() => {
    let unsubscribe = null

    const setupSubscription = () => {
      unsubscribe = subscribeToDeviceData('PM_001', (data, err) => {
        if (err) {
          setError(err.message || 'Failed to connect to Firebase')
          setLoading(false)
          return
        }

        // If no error but also no data, it means path exists but is empty
        if (data === null && !err) {
          setError(null) // Clear any previous errors
          setLoading(false)
          // Keep showing last data if available, or show "no data" state
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

          // Add to history for charts (keep last 20 points)
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
            return newHistory.slice(-20) // Keep last 20 data points
          })

          // Generate alerts based on thresholds
          const thresholds = getAllThresholds()
          const warnings = generateFeatureWarnings(data.features || {}, thresholds)
          const healthStatus = getHealthStatus(data.edge_health || 0)

          // Create alerts from warnings and health status
          const newAlerts = []
          
          warnings.forEach((warning, index) => {
            newAlerts.push({
              id: `warning-${data.timestamp}-${index}`,
              message: warning.message,
              severity: warning.severity,
              timestamp: data.timestamp * 1000,
              type: 'feature_warning'
            })
          })

          if (healthStatus.severity === 'high') {
            newAlerts.push({
              id: `health-${data.timestamp}`,
              message: `Machine health is ${healthStatus.label.toLowerCase()}. Immediate attention required.`,
              severity: 'high',
              timestamp: data.timestamp * 1000,
              type: 'health_status'
            })
          }

          setAlerts(prev => {
            // Merge new alerts, avoiding duplicates
            const existingIds = new Set(prev.map(a => a.id))
            const uniqueNewAlerts = newAlerts.filter(a => !existingIds.has(a.id))
            return [...prev, ...uniqueNewAlerts].slice(-50) // Keep last 50 alerts
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
  }, [])

  // GSAP animations - only run once on initial load
  const hasAnimatedRef = useRef(false)
  useEffect(() => {
    if (!deviceData || loading || hasAnimatedRef.current) return

    hasAnimatedRef.current = true

    const ctx = gsap.context(() => {
      // Animate header
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

      // Animate sensor cards
      if (sensorCardsRef.current) {
        gsap.fromTo(sensorCardsRef.current.children, {
          opacity: 0,
          y: 30,
          scale: 0.9
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.2,
          ease: 'back.out(1.4)'
        })
      }

      // Animate charts
      if (chartsRef.current) {
        gsap.fromTo(chartsRef.current.children, {
          opacity: 0,
          y: 40
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
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
        <div className="text-white">Connecting to device...</div>
      </div>
    )
  }

  if (error && !deviceData) {
    const errorMessage = error?.message || error || 'Unknown error'
    const errorCode = error?.code || ''
    
    return (
      <div className="p-8">
        <div className="bg-red-900 border-2 border-red-500 rounded-lg p-6 text-red-200 shadow-lg">
          <div className="font-semibold mb-2">Connection Error</div>
          <div className="text-sm mb-2">{errorMessage}</div>
          {errorCode && <div className="text-xs text-red-300 mb-2">Error Code: {errorCode}</div>}
          <div className="text-xs mt-4 space-y-1">
            <div className="font-semibold">Troubleshooting:</div>
            <div>1. Check browser console (F12) for detailed error messages</div>
            <div>2. Verify Firestore Database is enabled in Firebase Console</div>
            <div>3. Check Firestore Rules allow read access</div>
            <div>4. Ensure data exists at: <code className="bg-slate-800 px-1 rounded">devices/PM_001/live/latest</code></div>
            <div>5. Verify Project ID in .env file matches your Firebase project</div>
          </div>
        </div>
      </div>
    )
  }

  if (!deviceData && !loading && !error) {
    return (
      <div className="p-8">
        <div className="bg-yellow-900 border-2 border-yellow-500 rounded-lg p-4 text-yellow-200">
          <div className="font-semibold mb-2">No Data Available</div>
          <div className="text-sm mb-4">No data found at the Firestore path: <code className="bg-slate-800 px-1 rounded">devices/PM_001/live/latest</code></div>
          <div className="text-xs space-y-1">
            <div>Please ensure:</div>
            <div>1. Data exists in Firestore Database at the correct path</div>
            <div>2. Firestore Rules allow read access</div>
            <div>3. Check browser console (F12) for any warnings</div>
            <div>4. See FIREBASE_SETUP_GUIDE.md for detailed instructions</div>
          </div>
        </div>
      </div>
    )
  }

  const healthStatus = getHealthStatus(deviceData.edge_health || 0)
  const features = deviceData.features || {}
  const thresholds = getAllThresholds()

  return (
    <div ref={containerRef} className="p-8 space-y-8">
      {/* Device Summary Header */}
      <div ref={headerRef} className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Device PM_001</h1>
            <p className="text-sm text-white mt-1">
              Last updated: {formatTimestamp(deviceData.timestamp)} ({getTimeAgo(deviceData.timestamp)})
            </p>
          </div>
          <StatusIndicator healthScore={deviceData.edge_health} size="lg" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4">
            <div className="text-sm text-white mb-1 font-medium">Overall Health</div>
            <div className="text-3xl font-bold text-cyan-300">{deviceData.edge_health || 0}%</div>
            <HealthBadge healthScore={deviceData.edge_health} deviceId="PM_001" />
          </div>
          <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4">
            <div className="text-sm text-white mb-1 font-medium">Status</div>
            <div className="text-lg font-semibold text-white">{healthStatus.label}</div>
            <div className="text-xs text-slate-300 mt-1">{healthStatus.description}</div>
          </div>
          <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4">
            <div className="text-sm text-white mb-1 font-medium">Device ID</div>
            <div className="text-lg font-mono text-white">{deviceData.device_id || 'PM_001'}</div>
          </div>
        </div>
      </div>

      {/* Live Sensor Cards */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Live Sensor Data</h2>
        <div ref={sensorCardsRef} className="grid md:grid-cols-3 gap-6">
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
      
      {/* Mini Live Trend Charts */}
      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Live Trends</h2>
          <div ref={chartsRef} className="grid md:grid-cols-3 gap-6">
            {['temp_mean', 'vib_rms', 'current_rms'].map((feature) => (
              <div key={feature} className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4 shadow-lg">
                <div className="text-sm text-white mb-2 capitalize font-medium">
                  {feature.replace('_', ' ')}
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Line
                      type="monotone"
                      dataKey={feature}
                      stroke={
                        feature === 'temp_mean' ? '#60a5fa' :
                        feature === 'vib_rms' ? '#22d3ee' :
                        '#34d399'
                      }
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Active Alerts</h2>
        <AlertTable alerts={alerts} />
      </div>
    </div>
  )
}

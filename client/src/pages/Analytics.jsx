import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { subscribeToDeviceData } from '../services/firebase'
import { formatTimestamp } from '../services/statusLogic'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from 'recharts'

export default function Analytics() {
  const [deviceData, setDeviceData] = useState(null)
  const [history, setHistory] = useState([])
  const [timeRange, setTimeRange] = useState('all') // 'all', '1h', '6h', '24h'
  const containerRef = useRef(null)
  const statsRef = useRef(null)
  const chartsRef = useRef(null)

  useEffect(() => {
    let unsubscribe = null

    const setupSubscription = () => {
      unsubscribe = subscribeToDeviceData('PM_001', (data) => {
        if (data) {
          // Only update if data actually changed
          setDeviceData(prev => {
            if (prev && prev.timestamp === data.timestamp) {
              return prev
            }
            return data
          })

          // Add to history
          const newPoint = {
            timestamp: data.timestamp,
            time: formatTimestamp(data.timestamp),
            temp_mean: data.features?.temp_mean || 0,
            vib_rms: data.features?.vib_rms || 0,
            current_rms: data.features?.current_rms || 0,
            edge_health: data.edge_health || 0
          }

          setHistory(prev => {
            // Check if this timestamp already exists to avoid duplicates
            if (prev.length > 0 && prev[prev.length - 1].timestamp === newPoint.timestamp) {
              return prev // Don't add duplicate
            }
            const updated = [...prev, newPoint]
            // Filter by time range if needed
            if (timeRange !== 'all') {
              const now = Math.floor(Date.now() / 1000)
              const rangeSeconds = {
                '1h': 3600,
                '6h': 21600,
                '24h': 86400
              }[timeRange] || 0
              return updated.filter(point => point.timestamp >= now - rangeSeconds)
            }
            return updated.slice(-1000) // Keep last 1000 points max
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
  }, [timeRange])

  // GSAP animations - only run once on initial load
  const hasAnimatedRef = useRef(false)
  useEffect(() => {
    if (hasAnimatedRef.current) return

    hasAnimatedRef.current = true

    const ctx = gsap.context(() => {
      if (statsRef.current) {
        gsap.fromTo(statsRef.current.children, {
          opacity: 0,
          y: 20,
          scale: 0.95
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.4)'
        })
      }

      if (chartsRef.current) {
        gsap.fromTo(chartsRef.current.children, {
          opacity: 0,
          y: 40
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          delay: 0.3,
          ease: 'power2.out'
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Calculate statistics
  const stats = history.length > 0 ? {
    temp_mean: {
      min: Math.min(...history.map(h => h.temp_mean)),
      max: Math.max(...history.map(h => h.temp_mean)),
      avg: history.reduce((sum, h) => sum + h.temp_mean, 0) / history.length
    },
    vib_rms: {
      min: Math.min(...history.map(h => h.vib_rms)),
      max: Math.max(...history.map(h => h.vib_rms)),
      avg: history.reduce((sum, h) => sum + h.vib_rms, 0) / history.length
    },
    current_rms: {
      min: Math.min(...history.map(h => h.current_rms)),
      max: Math.max(...history.map(h => h.current_rms)),
      avg: history.reduce((sum, h) => sum + h.current_rms, 0) / history.length
    },
    edge_health: {
      min: Math.min(...history.map(h => h.edge_health)),
      max: Math.max(...history.map(h => h.edge_health)),
      avg: history.reduce((sum, h) => sum + h.edge_health, 0) / history.length
    }
  } : null

  return (
    <div ref={containerRef} className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex gap-2">
          {['all', '1h', '6h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800 border-2 border-slate-600'
              }`}
            >
              {range === 'all' ? 'All' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div ref={statsRef} className="grid md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4 shadow-lg">
            <div className="text-sm text-slate-400 mb-2">Temperature</div>
            <div className="text-lg font-semibold text-slate-200">
              Avg: {stats.temp_mean.avg.toFixed(2)}°C
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Range: {stats.temp_mean.min.toFixed(2)} - {stats.temp_mean.max.toFixed(2)}°C
            </div>
          </div>
          <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4 shadow-lg">
            <div className="text-sm text-slate-400 mb-2">Vibration</div>
            <div className="text-lg font-semibold text-slate-200">
              Avg: {stats.vib_rms.avg.toFixed(2)} m/s²
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Range: {stats.vib_rms.min.toFixed(2)} - {stats.vib_rms.max.toFixed(2)} m/s²
            </div>
          </div>
          <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4 shadow-lg">
            <div className="text-sm text-slate-400 mb-2">Current</div>
            <div className="text-lg font-semibold text-slate-200">
              Avg: {stats.current_rms.avg.toFixed(2)} A
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Range: {stats.current_rms.min.toFixed(2)} - {stats.current_rms.max.toFixed(2)} A
            </div>
          </div>
          <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4 shadow-lg">
            <div className="text-sm text-slate-400 mb-2">Health Score</div>
            <div className="text-lg font-semibold text-slate-200">
              Avg: {stats.edge_health.avg.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Range: {stats.edge_health.min.toFixed(1)} - {stats.edge_health.max.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Charts Container */}
      {history.length > 0 && (
        <div ref={chartsRef} className="space-y-8">
          {/* Temperature Trend */}
          <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Temperature Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Area
                  type="monotone"
                  dataKey="temp_mean"
                  stroke="#60a5fa"
                  fill="#60a5fa"
                  fillOpacity={0.8}
                  name="Temperature (°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Vibration Trend */}
          <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Vibration Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Area
                  type="monotone"
                  dataKey="vib_rms"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.8}
                  name="Vibration (m/s²)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Current Trend */}
          <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Current Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Area
                  type="monotone"
                  dataKey="current_rms"
                  stroke="#34d399"
                  fill="#34d399"
                  fillOpacity={0.8}
                  name="Current (A)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Combined Chart */}
          <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">All Features Over Time</h2>
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
        </div>
      )}

      {history.length === 0 && (
        <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-8 text-center shadow-xl">
          <div className="text-slate-400">No historical data available yet</div>
          <div className="text-sm text-slate-500 mt-2">Data will appear as it is received from the device</div>
        </div>
      )}
    </div>
  )
}


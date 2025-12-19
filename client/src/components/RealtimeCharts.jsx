import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts'

const getSocketBaseUrl = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL
  if (envUrl) return envUrl.replace(/\/$/, '')
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const port = 5000
    const scheme = protocol === 'https:' ? 'https' : 'http'
    return `${scheme}://${hostname}:${port}`
  }
  return 'http://localhost:5000'
}
const SOCKET_URL = getSocketBaseUrl()

export default function RealtimeCharts() {
  const [series, setSeries] = useState([])
  const [currentReadings, setCurrentReadings] = useState({})

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/sensors`, {
      transports: ['polling'],
      path: '/socket.io',
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })
    
    socket.on('sensor_update', (payload) => {
      const now = new Date().toLocaleTimeString()
      setSeries((prev) => {
        const next = [...prev]
        payload.forEach((p) => {
          next.push({
            t: now,
            machineId: p.machineId,
            temperature: p.temperature,
            vibration: p.vibration,
            current: p.current,
            healthScore: p.healthScore,
          })
        })
        return next.slice(-60) // Keep last 60 data points
      })
      
      // Update current readings for live display
      payload.forEach((p) => {
        setCurrentReadings(prev => ({
          ...prev,
          [p.machineId]: {
            temperature: p.temperature,
            vibration: p.vibration,
            current: p.current,
            healthScore: p.healthScore,
            timestamp: now
          }
        }))
      })
    })
    
    socket.on('connect_error', () => {})
    socket.on('error', () => {})
    return () => socket.disconnect()
  }, [])

  const colors = useMemo(() => ({
    temperature: '#60a5fa',
    vibration: '#22d3ee',
    current: '#34d399',
    healthScore: '#f59e0b',
  }), [])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm mb-2">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'temperature' ? '°C' : entry.dataKey === 'vibration' ? 'mm/s' : entry.dataKey === 'current' ? 'A' : ''}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getStatusColor = (value, type) => {
    switch (type) {
      case 'temperature':
        return value > 85 ? 'text-red-400' : value > 75 ? 'text-yellow-400' : 'text-green-400'
      case 'vibration':
        return value > 30 ? 'text-red-400' : value > 20 ? 'text-yellow-400' : 'text-green-400'
      case 'current':
        return value > 12 ? 'text-red-400' : value > 8 ? 'text-yellow-400' : 'text-green-400'
      case 'healthScore':
        return value < 40 ? 'text-red-400' : value < 70 ? 'text-yellow-400' : 'text-green-400'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Live Readings Display */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Live Sensor Readings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(currentReadings).map(([machineId, readings]) => (
            <div key={machineId} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-200">{machineId}</span>
                <span className="text-xs text-slate-400">{readings.timestamp}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`${getStatusColor(readings.temperature, 'temperature')}`}>
                  Temp: {readings.temperature}°C
                </div>
                <div className={`${getStatusColor(readings.vibration, 'vibration')}`}>
                  Vib: {readings.vibration}mm/s
                </div>
                <div className={`${getStatusColor(readings.current, 'current')}`}>
                  Cur: {readings.current}A
                </div>
                <div className={`${getStatusColor(readings.healthScore, 'healthScore')}`}>
                  Health: {readings.healthScore}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Temperature Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-300">Temperature</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-slate-400">°C</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <XAxis dataKey="t" hide />
              <YAxis domain={[60, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="temperature" 
                stroke={colors.temperature} 
                fill={colors.temperature}
                fillOpacity={0.2}
                strokeWidth={2}
                dot={false}
              />
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vibration Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-300">Vibration</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <span className="text-xs text-slate-400">mm/s</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 50]} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="vibration" 
                stroke={colors.vibration} 
                fill={colors.vibration}
                fillOpacity={0.2}
                strokeWidth={2}
                dot={false}
              />
              <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Current Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-300">Current</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-slate-400">A</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 20]} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="current" 
                stroke={colors.current} 
                fill={colors.current}
                fillOpacity={0.2}
                strokeWidth={2}
                dot={false}
              />
              <ReferenceLine y={12} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={8} stroke="#f59e0b" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health Score Trend */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-slate-300">Health Score Trend</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-slate-400">Score</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="healthScore" 
              stroke={colors.healthScore} 
              strokeWidth={3}
              dot={false}
            />
            <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" />
            <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
          })
        })
        return next.slice(-60)
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
  }), [])

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
        <div className="text-sm text-slate-300 mb-2">Vibration</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
            <XAxis dataKey="t" hide/>
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="vibration" stroke={colors.vibration} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
        <div className="text-sm text-slate-300 mb-2">Temperature</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
            <XAxis dataKey="t" hide/>
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke={colors.temperature} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
        <div className="text-sm text-slate-300 mb-2">Current</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
            <XAxis dataKey="t" hide/>
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="current" stroke={colors.current} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}



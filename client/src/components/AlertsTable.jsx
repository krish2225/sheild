import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

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

export default function AlertsTable() {
  const [alerts, setAlerts] = useState([])
  useEffect(() => {
    const socket = io(`${SOCKET_URL}/alerts`, { transports: ['websocket', 'polling'], path: '/socket.io', withCredentials: true })
    socket.on('alert', (a) => {
      // Only add high-risk alerts (high and critical severity)
      if (a.severity === 'high' || a.severity === 'critical') {
        setAlerts((prev) => {
          // Check if machine already exists in alerts
          const existingIndex = prev.findIndex(alert => alert.machineId === a.machineId)
          
          if (existingIndex !== -1) {
            // Update existing alert for this machine
            const updated = [...prev]
            updated[existingIndex] = a
            return updated
          } else {
            // Add new alert for this machine
            return [a, ...prev].slice(0, 10)
          }
        })
      }
    })
    socket.on('connect_error', () => {})
    socket.on('error', () => {})
    return () => socket.disconnect()
  }, [])
  const badge = (sev) => ({
    low: 'bg-slate-700 text-slate-200',
    medium: 'bg-amber-700/60 text-amber-200',
    high: 'bg-orange-700/60 text-orange-100',
    critical: 'bg-red-700/70 text-red-100',
  }[sev] || 'bg-slate-700 text-slate-200')

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
      <div className="text-lg font-semibold text-slate-200 mb-4">High-risk Alerts</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-3 font-medium">Time</th>
              <th className="text-left py-3 font-medium">Machine</th>
              <th className="text-left py-3 font-medium">Alert</th>
              <th className="text-left py-3 font-medium">Severity</th>
              <th className="text-left py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a, i) => (
              <tr key={i} className="border-t border-slate-700 hover:bg-slate-800/50 transition-colors">
                <td className="py-3 text-slate-400">{new Date(a.timestamp).toLocaleTimeString()}</td>
                <td className="py-3 font-medium">{a.machineId}</td>
                <td className="py-3">{a.message}</td>
                <td className="py-3"><span className={`px-3 py-1.5 rounded-full text-xs font-medium ${badge(a.severity)}`}>{a.severity}</span></td>
                <td className="py-3 text-slate-400">{a.status}</td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">No high-risk alerts</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}



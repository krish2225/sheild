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
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([])
  
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
    
    socket.on('maintenance_alert', (alert) => {
      setMaintenanceAlerts((prev) => {
        const existingIndex = prev.findIndex(a => a.machineId === alert.machineId)
        if (existingIndex !== -1) {
          const updated = [...prev]
          updated[existingIndex] = alert
          return updated
        } else {
          return [alert, ...prev].slice(0, 5)
        }
      })
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
    <div className="space-y-6">
      {/* Live Alerts */}
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">Live Alerts</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-400">Real-time</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-300">
              <tr>
                <th className="text-left py-3 font-medium">Time</th>
                <th className="text-left py-3 font-medium">Machine</th>
                <th className="text-left py-3 font-medium">Alert</th>
                <th className="text-left py-3 font-medium">Readings</th>
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
                  <td className="py-3">
                    {a.sensorReadings ? (
                      <div className="text-xs space-y-1">
                        <div className="flex gap-2">
                          <span className="text-blue-400">T: {a.sensorReadings.temperature}°C</span>
                          <span className="text-cyan-400">V: {a.sensorReadings.vibration}mm/s</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-green-400">C: {a.sensorReadings.current}A</span>
                          <span className="text-yellow-400">H: {a.sensorReadings.healthScore}</span>
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="py-3"><span className={`px-3 py-1.5 rounded-full text-xs font-medium ${badge(a.severity)}`}>{a.severity}</span></td>
                  <td className="py-3 text-slate-400">{a.status}</td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No high-risk alerts</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Head Notifications */}
      {maintenanceAlerts.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-200">Maintenance Head Notifications</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400">Urgent</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {maintenanceAlerts.map((alert, i) => (
              <div key={i} className="bg-red-800/30 border border-red-600/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-red-200">{alert.machineId}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-red-100 mb-2">{alert.message}</p>
                    {alert.sensorReadings && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-blue-300">Temperature: {alert.sensorReadings.temperature}°C</div>
                        <div className="text-cyan-300">Vibration: {alert.sensorReadings.vibration}mm/s</div>
                        <div className="text-green-300">Current: {alert.sensorReadings.current}A</div>
                        <div className="text-yellow-300">Health: {alert.sensorReadings.healthScore}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-red-400 ml-4">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
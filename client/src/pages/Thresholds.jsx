import { useEffect, useState } from 'react'
import { api } from '../lib/api'
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

export default function Thresholds() {
  const [machines, setMachines] = useState([])
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [thresholds, setThresholds] = useState({
    temperature: { warning: 80, critical: 90 },
    vibration: { warning: 25, critical: 35 },
    current: { warning: 12, critical: 15 },
    healthScore: { warning: 70, critical: 40 }
  })
  const [maintenanceHead, setMaintenanceHead] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [alertSettings, setAlertSettings] = useState({
    enabled: true,
    notifyMaintenanceHead: true,
    notifyEmail: true,
    notifySMS: false
  })
  const [thresholdAlerts, setThresholdAlerts] = useState([])

  useEffect(() => {
    loadMachines()
    
    // Listen for threshold alerts
    const socket = io(`${SOCKET_URL}/alerts`, { transports: ['websocket', 'polling'], path: '/socket.io', withCredentials: true })
    
    socket.on('threshold_alert', (alert) => {
      setThresholdAlerts(prev => [alert, ...prev].slice(0, 10))
    })
    
    return () => socket.disconnect()
  }, [])

  const loadMachines = async () => {
    try {
      const { data } = await api.get('/machines')
      setMachines(data.data.machines || [])
    } catch (error) {
      console.error('Error loading machines:', error)
    }
  }

  const handleMachineSelect = (machine) => {
    setSelectedMachine(machine)
    if (machine.thresholds) {
      setThresholds(machine.thresholds)
    }
    if (machine.maintenanceHead) {
      setMaintenanceHead(machine.maintenanceHead)
    }
    if (machine.alertSettings) {
      setAlertSettings(machine.alertSettings)
    }
  }

  const saveThresholds = async () => {
    if (!selectedMachine) return
    
    try {
      await api.put(`/machines/${selectedMachine._id}/thresholds`, {
        thresholds,
        maintenanceHead,
        alertSettings
      })
      alert('Thresholds saved successfully!')
      loadMachines()
    } catch (error) {
      console.error('Error saving thresholds:', error)
      alert('Error saving thresholds: ' + (error.response?.data?.message || error.message))
    }
  }

  const resetToDefaults = () => {
    setThresholds({
      temperature: { warning: 80, critical: 90 },
      vibration: { warning: 25, critical: 35 },
      current: { warning: 12, critical: 15 },
      healthScore: { warning: 70, critical: 40 }
    })
  }

  return (
    <div className="p-8 space-y-8">
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-200 mb-6">Machine Threshold Settings</h2>
        
        {/* Machine Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Machine</label>
          <select 
            value={selectedMachine?._id || ''} 
            onChange={(e) => {
              const machine = machines.find(m => m._id === e.target.value)
              handleMachineSelect(machine)
            }}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          >
            <option value="">Select a machine...</option>
            {machines.map((machine) => (
              <option key={machine._id} value={machine._id}>
                {machine.name} ({machine.machineId})
              </option>
            ))}
          </select>
        </div>

        {selectedMachine && (
          <div className="space-y-6">
            {/* Threshold Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Threshold Values</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(thresholds).map(([key, values]) => (
                  <div key={key} className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-300 capitalize">{key}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Warning</label>
                        <input
                          type="number"
                          value={values.warning}
                          onChange={(e) => setThresholds(prev => ({
                            ...prev,
                            [key]: { ...prev[key], warning: Number(e.target.value) }
                          }))}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Critical</label>
                        <input
                          type="number"
                          value={values.critical}
                          onChange={(e) => setThresholds(prev => ({
                            ...prev,
                            [key]: { ...prev[key], critical: Number(e.target.value) }
                          }))}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={resetToDefaults}
                className="mt-4 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg text-sm transition-colors"
              >
                Reset to Defaults
              </button>
            </div>

            {/* Maintenance Head Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Maintenance Head Contact</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={maintenanceHead.name}
                    onChange={(e) => setMaintenanceHead(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200"
                    placeholder="Maintenance Head Name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={maintenanceHead.email}
                    onChange={(e) => setMaintenanceHead(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={maintenanceHead.phone}
                    onChange={(e) => setMaintenanceHead(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Alert Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Alert Settings</h3>
              <div className="space-y-3">
                {Object.entries(alertSettings).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveThresholds}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg px-6 py-3 transition-colors shadow-lg hover:shadow-xl"
              >
                Save Threshold Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Threshold Alert History */}
      {thresholdAlerts.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Recent Threshold Alerts</h3>
          <div className="space-y-3">
            {thresholdAlerts.map((alert, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-slate-200">{alert.machineId}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'critical' ? 'bg-red-700/70 text-red-100' :
                        alert.severity === 'high' ? 'bg-orange-700/60 text-orange-100' :
                        'bg-amber-700/60 text-amber-200'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{alert.message}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Threshold: {alert.thresholdValue} | Current: {alert.sensorReadings?.[alert.thresholdType]}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">
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

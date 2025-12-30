import { useState } from 'react'

/**
 * AlertTable component - Displays alerts with acknowledgement toggle
 * @param {array} alerts - Array of alert objects
 * @param {function} onAcknowledge - Callback when alert is acknowledged
 */
export default function AlertTable({ alerts = [], onAcknowledge }) {
  const [acknowledged, setAcknowledged] = useState(new Set())

  const handleAcknowledge = (alertId) => {
    setAcknowledged(prev => new Set([...prev, alertId]))
    if (onAcknowledge) {
      onAcknowledge(alertId)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'bg-red-900 text-red-100 border-red-500'
      case 'medium':
        return 'bg-yellow-900 text-yellow-200 border-yellow-500'
      case 'low':
        return 'bg-blue-900 text-blue-200 border-blue-500'
      default:
        return 'bg-slate-700 text-slate-200 border-slate-600'
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-8 text-center shadow-xl">
        <div className="text-slate-300">No alerts at this time</div>
        <div className="text-sm text-slate-400 mt-2">All systems operating normally</div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border-2 border-slate-600 rounded-lg overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
            <thead className="bg-slate-900 border-b-2 border-slate-700">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-white">Time</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-white">Alert</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-white">Severity</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-white">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => {
              const isAcknowledged = acknowledged.has(alert.id || index)
              return (
                <tr 
                  key={alert.id || index} 
                  className={`border-b-2 border-slate-700 hover:bg-slate-800 transition-colors ${
                    isAcknowledged ? 'bg-slate-900' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-slate-400">
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '--'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-200">{alert.message || alert.label || 'Alert'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity || 'medium'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      isAcknowledged 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {isAcknowledged ? 'Acknowledged' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {!isAcknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.id || index)}
                        className="text-xs px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


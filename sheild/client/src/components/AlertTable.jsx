import { useState } from 'react'
import AcknowledgeModal from './AcknowledgeModal'

/**
 * AlertTable component - Displays alerts with acknowledgement toggle
 * @param {array} alerts - Array of alert objects
 * @param {function} onAcknowledge - Callback when alert is acknowledged (receives alertId and acknowledgmentData)
 * @param {object} acknowledgments - Map of alertId to acknowledgment data
 */
export default function AlertTable({ alerts = [], onAcknowledge, acknowledgments = {} }) {
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAcknowledgeClick = (alert) => {
    setSelectedAlert(alert)
    setIsModalOpen(true)
  }

  const handleModalSubmit = (acknowledgmentData) => {
    const alertId = selectedAlert.id || alerts.indexOf(selectedAlert)
    if (onAcknowledge) {
      onAcknowledge(alertId, acknowledgmentData)
    }
    setIsModalOpen(false)
    setSelectedAlert(null)
  }

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert)
    setIsModalOpen(true)
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
    <div className="bg-slate-900 border-2 border-slate-600 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800 border-b-2 border-slate-700">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-white">Time</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-white">Alert Details</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-white">Severity</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-white">Status</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {alerts.map((alert, index) => {
              const alertId = alert.id || index
              const acknowledgment = acknowledgments[alertId]
              const isAcknowledged = !!acknowledgment
              
              return (
                <tr 
                  key={alertId} 
                  className={`hover:bg-slate-800/50 transition-colors ${
                    isAcknowledged ? 'bg-slate-900/50 opacity-75' : 'bg-slate-900'
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="text-xs text-slate-400 whitespace-nowrap">
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '--'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-white">
                        {alert.message || alert.label || 'Alert'}
                      </div>
                      {alert.failurePrediction && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Component:</span>
                              <span className="text-xs font-semibold text-cyan-300">{alert.failurePrediction.component}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Risk:</span>
                              <span className="text-xs font-bold text-yellow-300">{alert.failurePrediction.probability}%</span>
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${
                                alert.failurePrediction.riskLevel === 'critical' ? 'bg-red-900 text-red-200 border-red-500' :
                                alert.failurePrediction.riskLevel === 'high' ? 'bg-orange-900 text-orange-200 border-orange-500' :
                                'bg-yellow-900 text-yellow-200 border-yellow-500'
                              }`}>
                                {alert.failurePrediction.riskLevel.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {alert.failurePrediction.indicators && alert.failurePrediction.indicators.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-slate-400">Indicators:</span>
                              <div className="flex gap-1.5 flex-wrap">
                                {alert.failurePrediction.indicators.map((ind, idx) => (
                                  <span key={idx} className="text-xs px-2 py-0.5 bg-red-900/30 text-red-300 rounded border border-red-700">
                                    {ind.feature.replace('_', ' ')}: {ind.value.toFixed(2)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-2 pt-1 border-t border-slate-700">
                            <span className="text-xs text-cyan-400">💡</span>
                            <span className="text-xs text-cyan-300">{alert.failurePrediction.recommendedAction}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1.5 rounded text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity || 'medium'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs px-3 py-1.5 rounded font-medium ${
                      isAcknowledged 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {isAcknowledged ? 'Acknowledged' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {!isAcknowledged ? (
                        <button
                          onClick={() => handleAcknowledgeClick(alert)}
                          className="text-xs px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all hover:scale-105 font-medium shadow-lg"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewDetails(alert)}
                          className="text-xs px-4 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-all hover:scale-105 font-medium"
                          title="View acknowledgment details"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Acknowledge Modal */}
      <AcknowledgeModal
        isOpen={isModalOpen}
        alert={selectedAlert}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAlert(null)
        }}
        onSubmit={handleModalSubmit}
        acknowledgment={selectedAlert ? acknowledgments[selectedAlert.id || alerts.indexOf(selectedAlert)] : null}
      />
    </div>
  )
}


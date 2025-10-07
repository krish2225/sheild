import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [rule, setRule] = useState({ machineId: '', threshold: 40, severity: 'high', recipients: '' })

  const load = () => api.get('/alerts').then(({ data }) => setAlerts(data.data.alerts || []))
  useEffect(() => { load() }, [])

  const saveRule = async (e) => {
    e.preventDefault()
    try {
      console.log('Saving alert rule:', rule)
      await api.post('/alerts', { 
        machineId: rule.machineId, 
        message: `Rule set: threshold ${rule.threshold}`, 
        severity: rule.severity, 
        recipients: rule.recipients ? rule.recipients.split(',').map(s=>s.trim()) : []
      })
      console.log('Alert rule saved successfully')
      load()
    } catch (error) {
      console.error('Error saving alert rule:', error)
      alert('Error saving alert rule: ' + (error.response?.data?.message || error.message))
    }
  }

  const remove = async (id) => {
    try {
      await api.delete(`/alerts/${id}`)
      load()
    } catch (error) {
      alert('Error deleting alert: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Create Alert Rule</h2>
        <form onSubmit={saveRule} className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Machine ID</label>
            <input 
              placeholder="Enter Machine ID" 
              value={rule.machineId} 
              onChange={(e)=>setRule({...rule, machineId:e.target.value})} 
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Threshold</label>
            <input 
              type="number" 
              placeholder="40" 
              value={rule.threshold} 
              onChange={(e)=>setRule({...rule, threshold:e.target.value})} 
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
            <select 
              value={rule.severity} 
              onChange={(e)=>setRule({...rule, severity:e.target.value})} 
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg px-6 py-3 transition-colors shadow-lg hover:shadow-xl">
              Save Rule
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Alert History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-300">
              <tr>
                <th className="text-left py-3 font-medium">Time</th>
                <th className="text-left py-3 font-medium">Machine</th>
                <th className="text-left py-3 font-medium">Alert</th>
                <th className="text-left py-3 font-medium">Severity</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-left py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a._id} className="border-t border-slate-700 hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 text-slate-400">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="py-3 font-medium">{a.machineId || '-'}</td>
                  <td className="py-3">{a.message}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      a.severity === 'critical' ? 'bg-red-700/70 text-red-100' :
                      a.severity === 'high' ? 'bg-orange-700/60 text-orange-100' :
                      a.severity === 'medium' ? 'bg-amber-700/60 text-amber-200' :
                      'bg-slate-700 text-slate-200'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{a.status}</td>
                  <td className="py-3">
                    <button onClick={()=>remove(a._id)} title="Delete" className="p-1.5 bg-red-700/70 hover:bg-red-700 rounded text-white inline-flex items-center">
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



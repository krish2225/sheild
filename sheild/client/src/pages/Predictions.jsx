import { useState } from 'react'
import { api } from '../lib/api'

export default function Predictions() {
  const [machineId, setMachineId] = useState('M-1001')
  const [features, setFeatures] = useState({ vibration: 12, temperature: 55 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [narrative, setNarrative] = useState('')
  const [csvLoading, setCsvLoading] = useState(false)
  const [lockedByCsv, setLockedByCsv] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      console.log('Submitting prediction request:', { machineId, features })
      const { data } = await api.post('/predictions/predict', { machineId, features })
      console.log('Prediction response:', data)
      setResult(data.data.prediction)
    } catch (error) {
      console.error('Prediction error:', error)
      alert('Error making prediction: ' + (error.response?.data?.message || error.message))
    } finally { 
      setLoading(false) 
    }
  }

  const setNumber = (k, v) => setFeatures((f) => ({ ...f, [k]: Number(v) }))

  // Upload CSV (single row or dataset); compute aggregate and populate fields, then predict
  const onUploadCsv = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvLoading(true)
    setNarrative('')
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter(Boolean)
      if (lines.length < 2) throw new Error('CSV appears empty')
      const headers = lines[0].split(',').map(h=>h.trim())
      const idx = {
        machineId: headers.indexOf('machineId'),
        vibration: headers.indexOf('vibration'),
        temperature: headers.indexOf('temperature'),
        current: headers.indexOf('current'),
      }
      if (idx.vibration < 0 || idx.temperature < 0 || idx.current < 0) {
        throw new Error('CSV must include vibration, temperature, current')
      }
      let sumV=0,sumT=0,sumC=0,count=0, mid='M-UNKNOWN'
      for (let i=1;i<lines.length;i++){
        const cols = lines[i].split(',')
        if (!cols.length) continue
        mid = idx.machineId>=0 ? (cols[idx.machineId]||mid) : mid
        const v = Number(cols[idx.vibration]||0)
        const t = Number(cols[idx.temperature]||0)
        const c = Number(cols[idx.current]||0)
        if (!Number.isNaN(v) || !Number.isNaN(t) || !Number.isNaN(c)){
          sumV += v; sumT += t; sumC += c; count++
        }
      }
      if (!count) throw new Error('No valid numeric rows found')
      const aggFeatures = {
        vibration: Number((sumV/count).toFixed(2)),
        temperature: Number((sumT/count).toFixed(2)),
        current: Number((sumC/count).toFixed(2)),
      }
      setFeatures(aggFeatures)
      setMachineId(mid || machineId)
      setLockedByCsv(true)
      setLoading(true)
      setResult(null)
      const { data } = await api.post('/predictions/predict', { machineId: mid || machineId, features: aggFeatures })
      setResult(data.data.prediction)
      const cls = data.data.prediction.classification
      setNarrative(`Dataset analyzed: Predicted ${cls.label.toUpperCase()} with ${(cls.confidence*100).toFixed(0)}% confidence. RUL ${data.data.prediction.rulHours} hours. Aggregated features (avg): vibration ${aggFeatures.vibration}, temperature ${aggFeatures.temperature}, current ${aggFeatures.current}.`)
    } catch (err) {
      alert('CSV analyze failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setCsvLoading(false)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-cyan-300 mb-2">AI-Powered Failure Prediction</h2>
        <p className="text-slate-400 mb-6">Analyze machine sensor data to predict potential failures and estimate remaining useful life</p>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Machine ID</label>
              <input 
                value={machineId} 
                onChange={(e)=>setMachineId(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>
            {!lockedByCsv && <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Vibration</label>
              <input 
                type="number" 
                value={features.vibration} 
                onChange={(e)=>setNumber('vibration', e.target.value)} 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>}
            {!lockedByCsv && <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Temperature</label>
              <input 
                type="number" 
                value={features.temperature} 
                onChange={(e)=>setNumber('temperature', e.target.value)} 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>}
            {!lockedByCsv && <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current</label>
              <input 
                type="number" 
                value={features.current||0} 
                onChange={(e)=>setNumber('current', e.target.value)} 
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>}
          </div>
          <button 
            disabled={loading} 
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg px-6 py-3 transition-colors shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Predict Failure'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Prediction Results</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-300 mb-1">Classification</div>
                <div className="text-2xl font-bold text-cyan-300">{result.classification.label}  {(result.classification.confidence*100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-300 mb-1">Remaining Useful Life</div>
                <div className="text-xl font-semibold text-cyan-300">{result.rulHours} hours</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-300 mb-3">Feature Importance</div>
              <div className="space-y-3">
                {Object.entries(result.featureImportance).map(([k,v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                      <span className="capitalize">{k}</span>
                      <span className="font-medium">{Math.round(v*100)}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-3 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${v*100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Upload Sensor CSV</h3>
        <p className="text-slate-400 mb-4">Upload a CSV (single row or dataset) with columns: machineId (optional), vibration, temperature, current. We’ll populate the inputs and predict.</p>
        <input type="file" accept=".csv" onChange={onUploadCsv} className="block" />
        {csvLoading && <div className="mt-3 text-slate-300">Analyzing CSV...</div>}
        {narrative && (
          <div className="mt-4 bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-slate-200">
            {narrative}
          </div>
        )}
      </div>
    </div>
  )
}



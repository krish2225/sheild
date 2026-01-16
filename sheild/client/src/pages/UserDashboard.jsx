import { useState } from 'react'
import { api } from '../lib/api'

export default function UserDashboard() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCsv = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null); setAnalysis(null)
    const text = await file.text()
    const [header, ...rows] = text.split(/\r?\n/).filter(Boolean)
    if (!header || rows.length === 0) { setError('CSV has no data rows'); return }
    const cols = header.split(',').map(h => h.trim())
    const first = rows[0].split(',')
    const get = (name) => {
      const i = cols.indexOf(name)
      if (i === -1) return undefined
      const v = first[i]
      return v === undefined || v === '' ? undefined : Number(v)
    }
    const machineId = (() => {
      const i = cols.indexOf('machineId'); return i >= 0 ? String(first[i]).trim() : 'M-UNKNOWN'
    })()
    const features = {
      vibration: get('vibration'),
      temperature: get('temperature'),
      current: get('current'),
      rms: get('rms'),
      kurtosis: get('kurtosis'),
      skewness: get('skewness'),
    }
    setLoading(true)
    try {
      const { data } = await api.post('/predictions/predict', { machineId, features })
      setAnalysis(data.data.prediction)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-cyan-300">Quick Predict</h1>
        <p className="text-slate-400 mt-1">Upload a single-row CSV with columns: machineId,vibration,temperature,current,rms,kurtosis,skewness</p>
        <input type="file" accept=".csv" onChange={handleCsv} className="mt-4" />
        {loading && <div className="mt-3 text-slate-300">Analyzing...</div>}
        {error && <div className="mt-3 text-red-400">{error}</div>}
      </div>
      {analysis && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-sm text-slate-400">Classification</div>
              <div className="text-2xl font-bold text-cyan-300 capitalize">{analysis.classification.label} – {(analysis.classification.confidence*100).toFixed(0)}%</div>
              <div className="text-sm text-slate-400 mt-4">Estimated RUL</div>
              <div className="text-xl font-semibold text-green-300">{analysis.rulHours} hours</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-2">Feature Importance</div>
              <div className="space-y-2">
                {Object.entries(analysis.featureImportance || {}).map(([k,v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs text-slate-400"><span className="capitalize">{k}</span><span>{Math.round(v*100)}%</span></div>
                    <div className="h-2 bg-slate-800 rounded"><div className="h-2 bg-cyan-600 rounded" style={{ width: `${v*100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



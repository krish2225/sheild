import { useState } from 'react'
import { api } from '../lib/api'

export default function Reports() {
  const [period, setPeriod] = useState('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState('pdf')
  const [contents, setContents] = useState(['performance','predictive-maintenance','RUL','alert-history'])

  const toggle = (c) => setContents((prev) => prev.includes(c) ? prev.filter((x)=>x!==c) : [...prev, c])

  const generate = async (e) => {
    e.preventDefault()
    const { data, headers } = await api.post('/reports/generate', { period, startDate, endDate, contents, format }, { responseType: 'blob' })
    const blob = new Blob([data], { type: headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report.${format==='pdf'?'pdf':'xlsx'}`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-4">
      <form onSubmit={generate} className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Period</label>
          <select value={period} onChange={(e)=>setPeriod(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Format</label>
          <select value={format} onChange={(e)=>setFormat(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2">
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Start</label>
          <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"/>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">End</label>
          <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"/>
        </div>
        <div className="md:col-span-2">
          <div className="text-sm text-slate-300 mb-1">Contents</div>
          <div className="flex flex-wrap gap-3 text-sm">
            {['performance','predictive-maintenance','RUL','alert-history'].map((c) => (
              <label key={c} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={contents.includes(c)} onChange={()=>toggle(c)} />
                <span className="capitalize">{c.replace('-',' ')}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <button className="bg-cyan-600 hover:bg-cyan-500 rounded px-4 py-2">Generate</button>
        </div>
      </form>
    </div>
  )
}



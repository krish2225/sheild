import { useState } from 'react'
import { api } from '../lib/api'

export default function Reports() {
  const [period, setPeriod] = useState('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState('pdf')
  const [contents, setContents] = useState(['performance','predictive-maintenance','RUL','alert-history'])
  const [isGenerating, setIsGenerating] = useState(false)

  const toggle = (c) => setContents((prev) => prev.includes(c) ? prev.filter((x)=>x!==c) : [...prev, c])

  const generate = async (e) => {
    e.preventDefault()
    setIsGenerating(true)
    try {
      const { data, headers } = await api.post('/reports/generate', { period, startDate, endDate, contents, format }, { responseType: 'blob' })
      const blob = new Blob([data], { type: headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report.${format==='pdf'?'pdf':'xlsx'}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">📊</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Generate Report</h2>
            <p className="text-sm text-slate-400">Create comprehensive reports for your industrial monitoring data</p>
          </div>
        </div>
        
        <form onSubmit={generate} className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Period</label>
              <select 
                value={period} 
                onChange={(e)=>setPeriod(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
              <select 
                value={format} 
                onChange={(e)=>setFormat(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              >
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e)=>setStartDate(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e)=>setEndDate(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-slate-300 mb-3">Report Contents</div>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { key: 'performance', label: 'Machine Performance', icon: '⚡' },
                { key: 'predictive-maintenance', label: 'Predictive Maintenance', icon: '🔧' },
                { key: 'RUL', label: 'Remaining Useful Life', icon: '⏱️' },
                { key: 'alert-history', label: 'Alert History', icon: '🚨' }
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={contents.includes(item.key)} 
                    onChange={()=>toggle(item.key)}
                    className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-slate-200">{item.icon} {item.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isGenerating}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-medium rounded-lg px-6 py-3 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span>📄</span>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Recent Reports */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[
            { name: 'Weekly Performance Report', date: '2024-01-15', size: '2.3 MB', type: 'PDF' },
            { name: 'Monthly Maintenance Summary', date: '2024-01-10', size: '1.8 MB', type: 'Excel' },
            { name: 'Alert Analysis Report', date: '2024-01-08', size: '1.2 MB', type: 'PDF' }
          ].map((report, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-xs">{report.type === 'PDF' ? '📄' : '📊'}</span>
                </div>
                <div>
                  <div className="text-slate-200 font-medium">{report.name}</div>
                  <div className="text-xs text-slate-400">{report.date} • {report.size}</div>
                </div>
              </div>
              <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



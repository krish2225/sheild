export default function KPI({ label, value, suffix, accent = 'text-cyan-300' }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-sm font-medium text-slate-300 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${accent}`}>
        {value}{suffix ? <span className="text-slate-400 text-lg ml-1">{suffix}</span> : null}
      </div>
    </div>
  )
}

export default function KPI({ label, value, suffix, accent = 'text-cyan-300', trend, icon }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-slate-600 group">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-slate-300">{label}</div>
        {icon && (
          <div className="text-slate-500 group-hover:text-slate-400 transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold ${accent} mb-2`}>
        {value}{suffix ? <span className="text-slate-400 text-lg ml-1">{suffix}</span> : null}
      </div>
      {trend && (
        <div className={`text-xs flex items-center gap-1 ${
          trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'
        }`}>
          <span>{trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}</span>
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  )
}
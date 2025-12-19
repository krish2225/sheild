export default function HealthGauge({ score = 75, machineId = 'M-1001', trend }) {
  const clamped = Math.max(0, Math.min(100, score))
  const circumference = 2 * Math.PI * 45
  const filled = (clamped / 100) * circumference
  const color = clamped < 40 ? '#ef4444' : clamped < 70 ? '#f59e0b' : '#22c55e'
  const status = clamped < 40 ? 'Critical' : clamped < 70 ? 'Warning' : 'Healthy'
  const statusColor = clamped < 40 ? 'text-red-400' : clamped < 70 ? 'text-yellow-400' : 'text-green-400'
  
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-slate-600 group">
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg width="140" height="90" viewBox="0 0 120 80">
            <defs>
              <linearGradient id={`g-${machineId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path d="M15 70 A55 55 0 0 1 105 70" fill="none" stroke="#374151" strokeWidth="16"/>
            <g transform="translate(60,70) rotate(-180)">
              <circle 
                r="45" 
                cx="0" 
                cy="0" 
                fill="none" 
                stroke={`url(#g-${machineId})`} 
                strokeWidth="16" 
                strokeDasharray={`${circumference}`} 
                strokeDashoffset={`${circumference - filled}`} 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </g>
            <text x="60" y="60" textAnchor="middle" fill="white" fontSize="20" fontWeight="700" className="transition-all duration-300">
              {clamped}%
            </text>
          </svg>
          {trend && (
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              trend > 0 ? 'bg-green-500 text-white' : trend < 0 ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'
            }`}>
              {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-300 mb-1">{machineId}</div>
          <div className={`text-2xl font-bold ${statusColor} mb-1`}>{status}</div>
          <div className="text-xs text-slate-400">
            {clamped < 40 ? 'Immediate attention required' : 
             clamped < 70 ? 'Monitor closely' : 'Operating normally'}
          </div>
        </div>
      </div>
    </div>
  )
}
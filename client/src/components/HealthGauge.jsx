export default function HealthGauge({ score = 75 }) {
  const clamped = Math.max(0, Math.min(100, score))
  const circumference = 2 * Math.PI * 45
  const filled = (clamped / 100) * circumference
  const color = clamped < 40 ? '#ef4444' : clamped < 70 ? '#f59e0b' : '#22c55e'
  const status = clamped < 40 ? 'Critical' : clamped < 70 ? 'Warning' : 'Healthy'
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-6">
        <svg width="140" height="90" viewBox="0 0 120 80">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M15 70 A55 55 0 0 1 105 70" fill="none" stroke="#374151" strokeWidth="16"/>
          <g transform="translate(60,70) rotate(-180)">
            <circle r="45" cx="0" cy="0" fill="none" stroke="url(#g)" strokeWidth="16" strokeDasharray={`${circumference}`} strokeDashoffset={`${circumference - filled}`} strokeLinecap="round"/>
          </g>
          <text x="60" y="60" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">{clamped}%</text>
        </svg>
        <div>
          <div className="text-sm font-medium text-slate-300 mb-2">Machine Health</div>
          <div className="text-2xl font-bold" style={{ color }}>{status}</div>
        </div>
      </div>
    </div>
  )
}



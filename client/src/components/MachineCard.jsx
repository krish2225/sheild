import { Link } from 'react-router-dom'

function StatusBadge({ status }) {
  const map = {
    normal: 'bg-green-900/40 text-green-300 border-green-700/50',
    warning: 'bg-amber-900/30 text-amber-200 border-amber-700/40',
    faulty: 'bg-red-900/40 text-red-200 border-red-700/50',
  }
  return <span className={`px-2 py-0.5 text-xs rounded border ${map[status] || 'bg-slate-800 text-slate-200 border-slate-700'}`}>{status}</span>
}

export default function MachineCard({ m }) {
  return (
    <Link to={`/machines/${m.machineId}`} className="block bg-slate-900/70 border border-slate-800 rounded-lg p-4 hover:border-cyan-700">
      <div className="flex items-center justify-between">
        <div className="text-slate-200 font-semibold">{m.name}</div>
        <StatusBadge status={m.status} />
      </div>
      <div className="text-xs text-slate-400 mt-1">ID: {m.machineId} • {m.location || 'Unknown'}</div>
      <div className="grid grid-cols-3 gap-2 text-sm mt-3">
        <div className="bg-slate-800/60 rounded p-2"><div className="text-slate-400 text-xs">Temp</div><div>{m.temperature ?? '-'}°C</div></div>
        <div className="bg-slate-800/60 rounded p-2"><div className="text-slate-400 text-xs">Vibration</div><div>{m.vibration ?? '-'} mm/s</div></div>
        <div className="bg-slate-800/60 rounded p-2"><div className="text-slate-400 text-xs">Current</div><div>{m.current ?? '-'} A</div></div>
      </div>
      <div className="mt-3">
        <div className="text-xs text-slate-400">RUL</div>
        <div className="h-2 bg-slate-800 rounded">
          <div className="h-2 bg-cyan-600 rounded" style={{ width: `${m.rulPct ?? 60}%` }} />
        </div>
      </div>
    </Link>
  )
}



import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import MachineCard from '../components/MachineCard'

export default function Machines() {
  const [machines, setMachines] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    api.get('/machines').then(({ data }) => setMachines(data.data.machines || [])).catch(() => setMachines([]))
  }, [])

  const filtered = useMemo(() => machines.filter((m) => {
    const matchesQ = q ? (m.machineId?.toLowerCase().includes(q.toLowerCase()) || m.name?.toLowerCase().includes(q.toLowerCase())) : true
    const matchesStatus = status ? m.status === status : true
    return matchesQ && matchesStatus
  }), [machines, q, status])

  return (
    <div className="p-6 space-y-4">
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 flex flex-wrap gap-3">
        <input placeholder="Search by ID or name" value={q} onChange={(e) => setQ(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="">All Status</option>
          <option value="normal">Normal</option>
          <option value="warning">Warning</option>
          <option value="faulty">Faulty</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map((m) => <MachineCard key={m.machineId} m={m} />)}
        {filtered.length === 0 && (
          <div className="text-slate-400">No machines found.</div>
        )}
      </div>
    </div>
  )
}



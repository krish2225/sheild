import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function MachineDetail() {
  const { machineId } = useParams()
  const [machine, setMachine] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    api.get(`/machines/${machineId}`).then(({ data }) => {
      setMachine(data.data.machine)
      setLogs((data.data.latestLogs || []).reverse())
    })
  }, [machineId])

  return (
    <div className="p-6 space-y-4">
      {!machine && <div className="text-slate-400">Loading...</div>}
      {machine && (
        <>
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
            <div className="text-xl font-semibold">{machine.name}</div>
            <div className="text-sm text-slate-400">ID: {machine.machineId} • {machine.location || 'Unknown'}</div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {['vibration','temperature','current'].map((k) => (
              <div key={k} className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
                <div className="text-sm text-slate-300 mb-2 capitalize">{k}</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={logs}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey={k} stroke={k==='vibration'?'#22d3ee':k==='temperature'?'#60a5fa':'#34d399'} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}



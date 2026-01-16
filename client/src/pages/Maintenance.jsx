import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DoneRoundedIcon from '@mui/icons-material/DoneRounded'

export default function Maintenance() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ machineId: '', task: '', dueDate: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => api.get('/maintenance').then(({ data }) => setTasks(data.data.tasks || []))
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    setError(null)
    if (!newTask.machineId || !newTask.task) {
      setError('Machine ID and Task are required')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/maintenance', newTask)
      setNewTask({ machineId: '', task: '', dueDate: '' })
      load()
    } catch (e) {
      setError(e?.response?.data?.message || e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const update = async (id, status) => {
    await api.put(`/maintenance/${id}`, { status })
    load()
  }

  const remove = async (id) => {
    await api.delete(`/maintenance/${id}`)
    load()
  }

  return (
    <div className="p-6 space-y-4">
      <form onSubmit={add} className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 grid md:grid-cols-4 gap-3">
        <input placeholder="Machine ID" value={newTask.machineId} onChange={(e)=>setNewTask({...newTask, machineId:e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-3 py-2"/>
        <input placeholder="Task" value={newTask.task} onChange={(e)=>setNewTask({...newTask, task:e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-3 py-2"/>
        <input type="date" value={newTask.dueDate} onChange={(e)=>setNewTask({...newTask, dueDate:e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-3 py-2"/>
        <button disabled={submitting} className="bg-cyan-600 hover:bg-cyan-500 rounded px-4 py-2 disabled:opacity-60">{submitting?'Adding...':'Add'}</button>
        {error && <div className="md:col-span-4 text-red-400">{error}</div>}
      </form>

      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="text-left py-2">Machine</th>
              <th className="text-left">Task</th>
              <th className="text-left">Due</th>
              <th className="text-left">Status</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t)=> (
              <tr key={t._id} className="border-t border-slate-800">
                <td className="py-2">{t.machineId}</td>
                <td>{t.task}</td>
                <td className="text-slate-400">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                <td className="capitalize">{t.status}</td>
                <td className="space-x-2">
                  <button onClick={()=>update(t._id,'completed')} title="Complete" className="p-1.5 bg-green-700 hover:bg-green-600 rounded text-white inline-flex items-center">
                    <DoneRoundedIcon fontSize="small" />
                  </button>
                  <button onClick={()=>remove(t._id)} title="Delete" className="p-1.5 bg-red-700 hover:bg-red-600 rounded text-white inline-flex items-center">
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}



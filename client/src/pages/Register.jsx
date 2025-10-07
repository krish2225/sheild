import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/auth/register', { name, email, password })
      navigate('/login', { state: { email } })
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 app-gradient">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-cyan-300">Create account</h1>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"/>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"/>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"/>
          </div>
        </div>
        {error && <div className="text-red-400 text-sm mt-2">{String(error)}</div>}
        <button disabled={submitting} className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded px-4 py-2 disabled:opacity-60">
          {submitting ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}



import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import Footer from '../components/Footer'

export default function Login() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    const prefill = location.state?.email
    if (prefill) setEmail(prefill)
  }, [location.state])
  const { login, error } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await login(email, password)
    setSubmitting(false)
    if (ok) {
      const state = (await import('../store/auth')).useAuth.getState()
      const role = state?.user?.role
      navigate(role === 'admin' ? '/admin' : '/user')
    }
  }

  return (
    <div className="min-h-screen app-gradient flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <form onSubmit={onSubmit} className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-cyan-300">Sign in</h1>
          <p className="text-slate-400 text-base">Admin: admin@example.com / password</p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-base text-slate-300 mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-base outline-none focus:ring-2 focus:ring-cyan-500"/>
            </div>
            <div>
              <label className="block text-base text-slate-300 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-base outline-none focus:ring-2 focus:ring-cyan-500"/>
            </div>
          </div>
          {error && <div className="text-red-400 text-base mt-3">{String(error)}</div>}
          <button disabled={submitting} className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-5 py-3 text-base disabled:opacity-60">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  )
}



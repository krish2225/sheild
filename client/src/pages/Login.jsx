import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import Footer from '../components/Footer'

export default function Login() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)
  const formRef = useRef(null)
  
  useEffect(() => {
    const prefill = location.state?.email
    if (prefill) setEmail(prefill)
  }, [location.state])
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (formRef.current) {
        gsap.fromTo(formRef.current, {
          opacity: 0,
          y: 30,
          scale: 0.95
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        })
        
        // Animate form elements
        gsap.fromTo(formRef.current.children, {
          opacity: 0,
          x: -20
        }, {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.2,
          ease: 'power2.out'
        })
      }
    }, containerRef)
    
    return () => ctx.revert()
  }, [])
  
  const { login, error } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await login(email, password)
    setSubmitting(false)
    if (ok) {
      navigate('/dashboard')
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen app-gradient flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <form ref={formRef} onSubmit={onSubmit} className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-slate-900 border-2 border-slate-600 rounded-2xl p-6 sm:p-8 shadow-2xl hover:shadow-2xl hover:shadow-cyan-500 transition-all">
          <h1 className="text-2xl font-semibold text-cyan-300">Sign in</h1>
          <p className="text-slate-400 text-base">Mock authentication - any credentials will work</p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-base text-slate-300 mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all hover:border-slate-600"/>
            </div>
            <div>
              <label className="block text-base text-slate-300 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all hover:border-slate-600"/>
            </div>
          </div>
          {error && <div className="text-red-400 text-base mt-3">{String(error)}</div>}
          <button disabled={submitting} className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-5 py-3 text-base disabled:bg-slate-700 disabled:cursor-not-allowed transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  )
}



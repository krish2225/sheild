import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen app-gradient flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/70">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-cyan-300 font-semibold text-lg">Shield IoT</div>
          <div className="text-sm text-slate-300 flex items-center gap-4">
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/register" className="hover:text-white">Sign up</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Predictive Maintenance for Enhanced Efficiency
            </h1>
            <p className="mt-4 text-slate-300 text-lg">
              Our solution leverages IoT data and AI insights to predict equipment failures, minimize downtime, and optimize maintenance schedules.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link to="/login" className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-6 py-3">Get Started</Link>
              <Link to="/register" className="text-cyan-300 hover:text-cyan-200">Create an account</Link>
            </div>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
            <div className="text-slate-300 mb-3">Why it’s better</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/60 rounded p-4">
                <div className="text-slate-400 text-sm">Faster insights</div>
                <div className="text-2xl font-semibold text-cyan-300">Real-time IoT streaming</div>
              </div>
              <div className="bg-slate-800/60 rounded p-4">
                <div className="text-slate-400 text-sm">Smarter predictions</div>
                <div className="text-2xl font-semibold text-red-300">Explainable AI scoring</div>
              </div>
              <div className="bg-slate-800/60 rounded p-4">
                <div className="text-slate-400 text-sm">Optimized uptime</div>
                <div className="text-2xl font-semibold text-green-300">RUL-driven scheduling</div>
              </div>
              <div className="bg-slate-800/60 rounded p-4">
                <div className="text-slate-400 text-sm">Seamless deployment</div>
                <div className="text-2xl font-semibold text-teal-300">Docker & cloud ready</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}



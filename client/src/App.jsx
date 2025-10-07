import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from './store/auth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Machines from './pages/Machines'
import MachineDetail from './pages/MachineDetail'
import Predictions from './pages/Predictions'
import Maintenance from './pages/Maintenance'
import Reports from './pages/Reports'
import Alerts from './pages/Alerts'
import Landing from './pages/Landing'
import UserDashboard from './pages/UserDashboard'

const queryClient = new QueryClient()

const Page = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold text-cyan-300">{title}</h1>
    <div className="mt-4 text-slate-300">Coming soon...</div>
  </div>
)

const AppLayout = ({ children }) => {
  const { fetchMe, token } = useAuth()
  useEffect(() => { if (token) fetchMe() }, [token])
  return (
    <div className="min-h-screen app-gradient">
      <nav className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-700 shadow-lg">
        <div className="w-full px-6 py-5 flex items-center gap-8">
          <Link to="/admin" className="text-cyan-300 font-bold text-2xl">Shield IoT</Link>
          <div className="text-base font-medium text-slate-200 flex gap-8">
            <Link to="/admin" className="hover:text-cyan-300 transition-colors">Dashboard</Link>
            <Link to="/machines" className="hover:text-cyan-300 transition-colors">Machines</Link>
            <Link to="/predictions" className="hover:text-cyan-300 transition-colors">Predictions</Link>
            <Link to="/maintenance" className="hover:text-cyan-300 transition-colors">Maintenance</Link>
            <Link to="/reports" className="hover:text-cyan-300 transition-colors">Reports</Link>
            <Link to="/alerts" className="hover:text-cyan-300 transition-colors">Alerts</Link>
          </div>
          <div className="ml-auto text-base text-slate-200">
            {token ? (
              <button onClick={() => useAuth.getState().logout()} className="px-6 py-2.5 rounded-lg bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-colors font-medium">Logout</button>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="hover:text-cyan-300 transition-colors font-medium">Login</Link>
                <Link to="/register" className="hover:text-cyan-300 transition-colors font-medium">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="w-full px-4 sm:px-6 overflow-x-hidden">{children}</main>
    </div>
  )
}

const RequireAuth = ({ children }) => {
  const { token } = useAuth()
  const location = useLocation()
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />
          <Route path="/user" element={<RequireAuth><AppLayout><UserDashboard /></AppLayout></RequireAuth>} />
          <Route path="/machines" element={<RequireAuth><AppLayout><Machines /></AppLayout></RequireAuth>} />
          <Route path="/machines/:machineId" element={<RequireAuth><AppLayout><MachineDetail /></AppLayout></RequireAuth>} />
          <Route path="/predictions" element={<RequireAuth><AppLayout><Predictions /></AppLayout></RequireAuth>} />
          <Route path="/maintenance" element={<RequireAuth><AppLayout><Maintenance /></AppLayout></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><AppLayout><Reports /></AppLayout></RequireAuth>} />
          <Route path="/alerts" element={<RequireAuth><AppLayout><Alerts /></AppLayout></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

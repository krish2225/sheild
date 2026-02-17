import { create } from 'zustand'
import { api } from '../lib/api'

// Initialize from localStorage
const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || null
  }
  return null
}

export const useAuth = create((set, get) => ({
  user: null,
  token: getStoredToken(),
  loading: false,
  error: null,
  async login(email, password) {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, token, loading: false })
      return true
    } catch (e) {
      set({ error: e?.response?.data?.message || e.message || 'Login failed', loading: false })
      return false
    }
  },
  async fetchMe() {
    const token = get().token
    if (!token) return
    
    set({ loading: true })
    try {
      const response = await api.get('/auth/me')
      const { user } = response.data.data
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, loading: false })
    } catch (e) {
      // If token is invalid, clear it
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null, loading: false })
    }
  },
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },
}))



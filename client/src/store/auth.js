import { create } from 'zustand'
import { api } from '../lib/api'

export const useAuth = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  async login(email, password) {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.data.token)
      set({ user: data.data.user, token: data.data.token, loading: false })
      return true
    } catch (e) {
      set({ error: e?.response?.data?.message || e.message || 'Login failed', loading: false })
      return false
    }
  },
  async fetchMe() {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.data.user })
    } catch {
      // ignore
    }
  },
  logout() {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))



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
      // MOCK AUTHENTICATION - No backend auth yet
      // Accept any email/password combination for trial phase
      const mockUser = {
        id: 'user_001',
        email: email,
        role: 'admin',
        name: email.split('@')[0]
      }
      const mockToken = 'mock_token_' + Date.now()
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      set({ user: mockUser, token: mockToken, loading: false })
      return true
    } catch (e) {
      set({ error: e?.response?.data?.message || e.message || 'Login failed', loading: false })
      return false
    }
  },
  async fetchMe() {
    // Mock auth - no backend call needed
    // User is already set during login
    const token = get().token
    if (token) {
      const storedUser = localStorage.getItem('user')
      const user = storedUser ? JSON.parse(storedUser) : (get().user || {
        id: 'user_001',
        email: 'user@example.com',
        role: 'admin',
        name: 'User'
      })
      set({ user })
      if (!storedUser) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
  },
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },
}))



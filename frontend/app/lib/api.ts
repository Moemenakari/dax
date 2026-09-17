import axios from 'axios'

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_URL = rawUrl.replace(/\/$/, '')

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default api

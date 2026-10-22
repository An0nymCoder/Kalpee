import axios from 'axios'

export function getCookie(name) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift())
  }
  return null
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor to ensure CSRF token header is always attached on mutating requests
api.interceptors.request.use((config) => {
  const token = getCookie('XSRF-TOKEN')
  if (token) {
    config.headers['X-XSRF-TOKEN'] = token
  }
  return config
})

// Global 401 listener hook for AuthContext
let onUnauthorizedCallback = null
export function setOnUnauthorized(cb) {
  onUnauthorizedCallback = cb
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    if (status === 401 && !url.includes('/auth/me') && !url.includes('/auth/login')) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback()
      }
    }
    return Promise.reject(error)
  }
)

export function extractErrorMessage(error, fallback = 'Une erreur est survenue.') {
  if (!error) return fallback
  const data = error.response?.data
  if (data?.message) return data.message
  if (typeof data === 'string' && data.trim()) return data
  return error.message || fallback
}

export function extractFieldErrors(error) {
  return error?.response?.data?.details || {}
}

export default api

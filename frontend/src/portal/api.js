import axios from 'axios'

/** Separate axios instance from src/lib/axios.js — this one carries the
 *  refresh-token cookie and an in-memory access token for the RBAC portals
 *  (super admin / admin / vendor / customer account), which is a different
 *  auth system from the storefront's local mock AuthContext. */
export const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

let accessToken = null
export const setAccessToken = token => { accessToken = token }
export const getAccessToken = () => accessToken

portalApi.interceptors.request.use(config => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

const NO_RETRY = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout']

let refreshing = null

/* When a refresh fails there is no session left, but the interceptor has no
   way to reach React state. It broadcasts instead, and PortalAuthContext
   clears the user — otherwise the dashboard keeps rendering for a dead
   session while every request 401s. */
const AUTH_LOST = 'portal:auth-lost'
export const onAuthLost = handler => {
  window.addEventListener(AUTH_LOST, handler)
  return () => window.removeEventListener(AUTH_LOST, handler)
}

portalApi.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error

    // On an expired access token, refresh once via the cookie and replay the request.
    if (response?.status === 401 && config && !config._retried && !NO_RETRY.some(p => config.url?.includes(p))) {
      config._retried = true
      refreshing ??= portalApi.post('/api/auth/refresh')
        .then(r => r.data.accessToken)
        .finally(() => { refreshing = null })

      try {
        const token = await refreshing
        setAccessToken(token)
        config.headers.Authorization = `Bearer ${token}`
        return portalApi(config)
      } catch {
        setAccessToken(null)
        window.dispatchEvent(new Event(AUTH_LOST))
      }
    }

    const data = response?.data
    const message =
      data?.issues?.map(i => i.message).join(' ') ||
      data?.error ||
      (!response ? `Cannot reach the API at ${portalApi.defaults.baseURL}.` : null) ||
      error.message

    const normalised = new Error(message)
    normalised.status = response?.status ?? null
    return Promise.reject(normalised)
  }
)

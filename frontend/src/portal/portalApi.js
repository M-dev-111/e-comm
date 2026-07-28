import axios from 'axios'

/* A dedicated axios instance for the authenticated SaaS portal. Separate from
   src/lib/axios.js (used by the public storefront/assistant) so the JWT is
   only ever attached to portal calls. */

const TOKEN_KEY = 'mcom_portal_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: t => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY)
}

export const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach the bearer token to every request when signed in.
portalApi.interceptors.request.use(config => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalise errors to a readable `message`, and surface auth expiry.
portalApi.interceptors.response.use(
  res => res,
  error => {
    const data = error.response?.data
    const message =
      data?.issues?.map(i => i.message).join(' ') ||
      data?.error ||
      (error.code === 'ECONNABORTED' ? 'Request timed out.' : null) ||
      (!error.response ? 'Cannot reach the server.' : null) ||
      error.message

    const normalised = new Error(message)
    normalised.status = error.response?.status ?? null
    normalised.isAuthError = error.response?.status === 401
    return Promise.reject(normalised)
  }
)

import axios from 'axios'

/** Single axios instance — base URL, timeout, and error shape live here. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' }
})

/**
 * Normalise every failure into an Error with a human-readable `message`,
 * so components never have to dig through err.response.data themselves.
 */
api.interceptors.response.use(
  response => response,
  error => {
    const data = error.response?.data

    // Zod validation failures come back as { error, issues: [{ path, message }] }
    const message =
      data?.issues?.map(i => i.message).join(' ') ||
      data?.error ||
      (error.code === 'ECONNABORTED' ? 'Request timed out.' : null) ||
      (!error.response ? `Cannot reach the API at ${api.defaults.baseURL}.` : null) ||
      error.message

    const normalised = new Error(message)
    normalised.status = error.response?.status ?? null
    normalised.issues = data?.issues ?? []
    return Promise.reject(normalised)
  }
)

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { portalApi, setAccessToken, onAuthLost } from './api'

const PortalAuthContext = createContext(null)

export function PortalAuthProvider ({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false

    /* On first load, silently resume a session from the refresh cookie.
       /refresh returns the freshly-read profile, so no follow-up /me is needed. */
    async function resume () {
      try {
        const { data } = await portalApi.post('/api/auth/refresh')
        setAccessToken(data.accessToken)
        if (!cancelled) setUser(data.user ?? null)
      } catch {
        setAccessToken(null)
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }

    resume()
    return () => { cancelled = true }
  }, [])

  // A mid-session refresh failure means the session is gone — drop the user.
  useEffect(() => onAuthLost(() => setUser(null)), [])

  const login = useCallback(async (email, password) => {
    const { data } = await portalApi.post('/api/auth/login', { email, password })
    setAccessToken(data.accessToken)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async payload => {
    const { data } = await portalApi.post('/api/auth/register', payload)
    setAccessToken(data.accessToken)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await portalApi.post('/api/auth/logout')
    } catch {
      // best-effort — clear local state regardless
    }
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout]
  )

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePortalAuth = () => {
  const ctx = useContext(PortalAuthContext)
  if (!ctx) throw new Error('usePortalAuth must be used inside <PortalAuthProvider>')
  return ctx
}

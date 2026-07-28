import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { portalApi, tokenStore } from './portalApi'

const PortalAuthContext = createContext(null)

/**
 * Portal authentication. On mount, if a token is stored, it validates it via
 * /api/auth/me so a tampered or expired token logs the user straight out.
 */
export function PortalAuthProvider ({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancelled = false
    async function bootstrap () {
      if (!tokenStore.get()) { setLoading(false); return }
      try {
        const { data } = await portalApi.get('/api/auth/me')
        if (!cancelled) setUser(data.user)
      } catch {
        tokenStore.clear()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    bootstrap()
    return () => { cancelled = true }
  }, [])

  const finishAuth = useCallback(({ token, user: u }) => {
    tokenStore.set(token)
    setUser(u)
  }, [])

  const login = useCallback(async credentials => {
    const { data } = await portalApi.post('/api/auth/login', credentials)
    finishAuth(data)
    return data.user
  }, [finishAuth])

  const register = useCallback(async payload => {
    const { data } = await portalApi.post('/api/auth/register', payload)
    finishAuth(data)
    return data.user
  }, [finishAuth])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    queryClient.clear() // never leak one account's cached data into the next
  }, [queryClient])

  return (
    <PortalAuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </PortalAuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePortalAuth = () => {
  const ctx = useContext(PortalAuthContext)
  if (!ctx) throw new Error('usePortalAuth must be used inside <PortalAuthProvider>')
  return ctx
}

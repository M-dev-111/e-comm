import { createContext, useContext, useEffect, useMemo, useState } from 'react'

/** Static auth — a "logged in" user persisted to localStorage. */

const AuthContext = createContext(null)
const STORAGE_KEY = 'bazario.auth.v1'

export function AuthProvider ({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY))
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const value = useMemo(
    () => ({
      user,
      login: (name, phone) => setUser({ name, phone }),
      logout: () => setUser(null)
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

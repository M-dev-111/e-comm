import { Navigate, useLocation } from 'react-router-dom'
import { usePortalAuth } from './PortalAuthContext'
import { homeFor } from './roles'

/** Route guard — redirects to loginPath unless the resumed session matches `role`. */
export default function RequireRole ({ role, loginPath, children }) {
  const { user, initializing } = usePortalAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className='flex min-h-dvh items-center justify-center bg-royal-50/40'>
        <p className='text-sm text-royal-900/50'>Loading…</p>
      </div>
    )
  }

  if (!user) return <Navigate to={loginPath} state={{ from: location }} replace />

  /* Signed in, wrong portal — send them to their own instead of the login
     screen, which would just reject the credentials they already have.
     This is the path an approved vendor takes when they revisit /account. */
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />

  return children
}

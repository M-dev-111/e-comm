import { Link, NavLink } from 'react-router-dom'
import { usePortalAuth } from '../PortalAuthContext'

/** Shared shell for the RBAC portals — top bar with identity/logout, optional tab nav. */
export default function PortalLayout ({ title, tabs, children }) {
  const { user, logout } = usePortalAuth()

  return (
    <div className='min-h-dvh bg-royal-50/30'>
      <header className='border-b border-royal-100 bg-white'>
        <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6'>
          <div>
            <h1 className='font-display text-lg font-extrabold tracking-tight text-royal-950'>{title}</h1>
            <p className='text-xs text-royal-900/50'>{user?.name} · {user?.email}</p>
          </div>
          <div className='flex items-center gap-2'>
            {/* Super admin is env-backed and has no password to rotate here. */}
            {user?.role !== 'super_admin' && (
              <Link
                to='/change-password'
                className='rounded-lg border border-royal-200 px-3.5 py-2 text-sm font-semibold text-royal-800 transition hover:bg-royal-50'
              >
                Change password
              </Link>
            )}
            <button
              onClick={logout}
              className='rounded-lg border border-royal-200 px-3.5 py-2 text-sm font-semibold text-royal-800 transition hover:bg-royal-50'
            >
              Log out
            </button>
          </div>
        </div>
        {tabs && (
          <nav className='mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6'>
            {tabs.map(tab => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
                    isActive ? 'border-royal-600 text-royal-800' : 'border-transparent text-royal-900/50 hover:text-royal-800'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className='mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8'>{children}</main>
    </div>
  )
}

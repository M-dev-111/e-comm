import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { PortalAuthProvider, usePortalAuth } from './PortalAuthContext'
import PortalLayout from './PortalLayout'
import PortalLogin from './PortalLogin'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Team from './pages/Team'
import Shop from './pages/Shop'
import { Spinner } from './ui'

function FullScreenSpinner () {
  return <div className='grid min-h-dvh place-items-center bg-slate-50'><Spinner label='Loading your portal…' /></div>
}

/** Blocks a route until authenticated; bounces to login remembering the target. */
function RequireAuth ({ children }) {
  const { user, loading } = usePortalAuth()
  const location = useLocation()
  if (loading) return <FullScreenSpinner />
  if (!user) return <Navigate to='/portal/login' state={{ from: location.pathname }} replace />
  return children
}

/** Restricts a route to specific roles; others are sent to their dashboard. */
function RoleRoute ({ roles, children }) {
  const { user } = usePortalAuth()
  if (!roles.includes(user.role)) return <Navigate to='/portal' replace />
  return children
}

/** Already-authenticated users skip the login screen. */
function RedirectIfAuthed ({ children }) {
  const { user, loading } = usePortalAuth()
  if (loading) return <FullScreenSpinner />
  if (user) return <Navigate to='/portal' replace />
  return children
}

function Router () {
  return (
    <Routes>
      <Route path='login' element={<RedirectIfAuthed><PortalLogin /></RedirectIfAuthed>} />
      <Route element={<RequireAuth><PortalLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path='companies' element={<RoleRoute roles={['superadmin']}><Companies /></RoleRoute>} />
        <Route path='products' element={<RoleRoute roles={['admin', 'vendor']}><Products /></RoleRoute>} />
        <Route path='orders' element={<Orders />} />
        <Route path='team' element={<RoleRoute roles={['admin']}><Team /></RoleRoute>} />
        <Route path='shop' element={<RoleRoute roles={['customer']}><Shop /></RoleRoute>} />
        <Route path='*' element={<Navigate to='/portal' replace />} />
      </Route>
    </Routes>
  )
}

/** Mounted at /portal/* by App.jsx. Owns its own auth provider. */
export default function PortalApp () {
  return (
    <PortalAuthProvider>
      <Router />
    </PortalAuthProvider>
  )
}

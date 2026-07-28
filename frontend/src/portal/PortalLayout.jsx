import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, Package, ShoppingBag, Store,
  Sparkles, LogOut, Menu, X
} from 'lucide-react'
import { usePortalAuth } from './PortalAuthContext'

/* Sidebar entries per role — the backend enforces access too, this just
   avoids showing links a role can't use. */
const NAV = {
  superadmin: [
    { to: '/portal', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portal/companies', label: 'Companies', icon: Building2 }
  ],
  admin: [
    { to: '/portal', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portal/products', label: 'Products', icon: Package },
    { to: '/portal/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/portal/team', label: 'Team', icon: Users }
  ],
  vendor: [
    { to: '/portal', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portal/products', label: 'My Products', icon: Package },
    { to: '/portal/orders', label: 'Orders', icon: ShoppingBag }
  ],
  customer: [
    { to: '/portal', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portal/shop', label: 'Shop', icon: Store },
    { to: '/portal/orders', label: 'My Orders', icon: ShoppingBag }
  ]
}

const ROLE_LABEL = { superadmin: 'Super Admin', admin: 'Admin', vendor: 'Vendor', customer: 'Customer' }

function NavItems ({ items, onNavigate }) {
  return (
    <nav className='space-y-1'>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
              isActive ? 'bg-royal-600 text-white shadow-glow-royal' : 'text-royal-100/80 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <item.icon className='h-4.5 w-4.5' />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function Sidebar ({ user, items, onLogout, onNavigate }) {
  return (
    <div className='flex h-full flex-col bg-linear-to-b from-royal-800 to-royal-950 p-4'>
      <Link to='/portal' onClick={onNavigate} className='mb-6 flex items-center gap-2 px-1.5 font-display text-lg font-extrabold text-white'>
        <span className='grid h-8 w-8 place-items-center rounded-lg bg-olive-500'><Sparkles className='h-4.5 w-4.5' /></span>
        mCOM
        <span className='ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-olive-200'>
          {ROLE_LABEL[user.role]}
        </span>
      </Link>
      <NavItems items={items} onNavigate={onNavigate} />
      <div className='mt-auto border-t border-white/10 pt-3'>
        <div className='px-1.5 pb-2'>
          <p className='truncate text-[13px] font-bold text-white'>{user.name}</p>
          <p className='truncate text-[11px] text-white/50'>{user.company?.name || 'Platform'}</p>
        </div>
        <button onClick={onLogout} className='flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white'>
          <LogOut className='h-4.5 w-4.5' /> Sign out
        </button>
      </div>
    </div>
  )
}

export default function PortalLayout () {
  const { user, logout } = usePortalAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = NAV[user.role] || []

  const doLogout = () => {
    logout()
    navigate('/portal/login', { replace: true })
  }

  return (
    <div className='min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]'>
      {/* desktop sidebar */}
      <aside className='sticky top-0 hidden h-dvh lg:block'>
        <Sidebar user={user} items={items} onLogout={doLogout} />
      </aside>

      {/* mobile top bar */}
      <div className='sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden'>
        <Link to='/portal' className='flex items-center gap-2 font-display font-extrabold text-royal-800'>
          <span className='grid h-7 w-7 place-items-center rounded-lg bg-olive-500 text-white'><Sparkles className='h-4 w-4' /></span>
          mCOM
        </Link>
        <button onClick={() => setMobileOpen(true)} aria-label='Open menu' className='grid h-9 w-9 place-items-center rounded-lg text-royal-700 hover:bg-slate-100'>
          <Menu className='h-5 w-5' />
        </button>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div className='absolute inset-0 bg-royal-950/50 backdrop-blur-sm' onClick={() => setMobileOpen(false)} />
          <div className='absolute inset-y-0 left-0 w-72 max-w-[80%]'>
            <button onClick={() => setMobileOpen(false)} aria-label='Close menu' className='absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10'>
              <X className='h-4.5 w-4.5' />
            </button>
            <Sidebar user={user} items={items} onLogout={doLogout} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className='mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8'>
        <Outlet />
      </main>
    </div>
  )
}

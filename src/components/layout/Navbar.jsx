import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, Heart, LogOut, MapPin, Package, Search, ShoppingCart,
  User, Zap
} from 'lucide-react'
import { PRODUCTS, CATEGORIES } from '../../data/data'
import { formatINR } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import Img from '../ui/Img'
import AuthModal from '../auth/AuthModal'

/* animated count badge — pops every time the number changes */
function CountBadge ({ count, tone = 'bg-olive-500' }) {
  if (!count) return null
  return (
    <AnimatePresence mode='popLayout'>
      <motion.span
        key={count}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        className={`absolute -right-1.5 -top-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full ${tone} px-1 text-[10px] font-bold text-white shadow`}
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    </AnimatePresence>
  )
}

/* search with live suggestions from data.js */
function SearchBox () {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    return PRODUCTS.filter(
      p =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
    ).slice(0, 6)
  }, [q])

  useEffect(() => {
    const onClick = e => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submit = e => {
    e.preventDefault()
    if (!q.trim()) return
    setOpen(false)
    navigate(`/products?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div ref={boxRef} className='relative w-full'>
      <form onSubmit={submit}>
        <div className='group flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2.5 ring-1 ring-white/15 transition-all focus-within:bg-white focus-within:ring-olive-400'>
          <Search className='h-4.5 w-4.5 shrink-0 text-white/50 transition-colors group-focus-within:text-royal-600' strokeWidth={2} />
          <input
            value={q}
            onChange={e => {
              setQ(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder='Search products, brands and more'
            className='w-full bg-transparent text-[13.5px] text-white outline-none transition-colors placeholder:text-white/40 group-focus-within:text-slate-900 group-focus-within:placeholder:text-slate-400'
          />
        </div>
      </form>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className='absolute inset-x-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card-hover'
          >
            {results.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setOpen(false)
                  setQ('')
                  navigate(`/product/${p.id}`)
                }}
                className='flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-royal-50/60'
              >
                <Img src={p.images[0]} alt='' className='h-10 w-10 rounded-lg object-cover' />
                <span className='min-w-0 flex-1'>
                  <span className='clamp-1 block text-[13px] font-medium text-slate-800'>{p.name}</span>
                  <span className='text-[11px] text-slate-400'>
                    {p.brand} · in {p.category}
                  </span>
                </span>
                <span className='text-[13px] font-bold text-slate-900'>{formatINR(p.price)}</span>
              </button>
            ))}
            <button
              onClick={submit}
              className='w-full bg-slate-50 px-4 py-2.5 text-center text-[12px] font-semibold text-royal-600 transition-colors hover:bg-royal-50'
            >
              See all results for “{q.trim()}”
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* Login button / logged-in user dropdown (dark header variant) */
function UserMenu ({ onLogin }) {
  const auth = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!auth.user) {
    return (
      <button
        onClick={onLogin}
        className='flex items-center gap-1.5 rounded-full bg-olive-500 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-glow-olive transition-colors hover:bg-olive-400'
      >
        <User className='h-4 w-4' strokeWidth={2.2} />
        Login
      </button>
    )
  }

  const firstName = auth.user.name.split(' ')[0]

  return (
    <div ref={menuRef} className='relative'>
      <button
        onClick={() => setOpen(v => !v)}
        className='flex items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-white/10'
      >
        <span className='grid h-6 w-6 place-items-center rounded-full bg-olive-500 text-[11px] font-bold text-white'>
          {firstName[0]?.toUpperCase()}
        </span>
        <span className='hidden sm:inline'>{firstName}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className='absolute right-0 top-[calc(100%+10px)] z-50 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card-hover'
          >
            <div className='border-b border-slate-100 px-4 py-3'>
              <p className='text-[13px] font-bold text-slate-900'>{auth.user.name}</p>
              <p className='text-[11.5px] text-slate-400'>+91 {auth.user.phone}</p>
            </div>
            <div className='p-1.5'>
              <button className='flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-royal-50 hover:text-royal-700'>
                <Package className='h-4 w-4' strokeWidth={2} /> My Orders
              </button>
              <Link
                to='/wishlist'
                onClick={() => setOpen(false)}
                className='flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-royal-50 hover:text-royal-700'
              >
                <Heart className='h-4 w-4' strokeWidth={2} /> Wishlist
              </Link>
              <button
                onClick={() => {
                  auth.logout()
                  setOpen(false)
                }}
                className='flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-semibold text-rose-500 transition-colors hover:bg-rose-50'
              >
                <LogOut className='h-4 w-4' strokeWidth={2} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* category chip bar — rounded pills, no icons, distinct navigation style */
function CategoryChips () {
  const { pathname, search } = useLocation()
  const activeCategory = new URLSearchParams(search).get('category')

  const chips = [
    { id: '__all', label: 'All Products', to: '/products', active: pathname === '/products' && !activeCategory },
    ...CATEGORIES.map(c => ({
      id: c.id,
      label: c.label,
      to: `/products?category=${c.id}`,
      active: pathname === '/products' && activeCategory === c.id
    }))
  ]

  return (
    <div className='border-b border-slate-200/70 bg-white'>
      <div className='mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-6'>
        <div className='no-scrollbar flex items-center gap-2 overflow-x-auto py-2.5'>
          {chips.map(chip => (
            <NavLink
              key={chip.id}
              to={chip.to}
              className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
                chip.active ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-royal-50 hover:text-royal-700'
              }`}
            >
              {chip.active && (
                <motion.span
                  layoutId='chip-pill'
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className='absolute inset-0 rounded-full bg-royal-600 shadow-glow-royal'
                />
              )}
              <span className='relative z-10'>{chip.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Navbar () {
  const cart = useCart()
  const wishlist = useWishlist()
  const { pathname } = useLocation()
  const onQuick = pathname.startsWith('/quick')
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className='sticky top-0 z-50'>
      {/* announcement strip */}
      <div className='bg-olive-600 text-center text-[11px] font-medium tracking-wide text-white'>
        <div className='py-1'>
          {onQuick
            ? 'Groceries delivered in minutes · Free delivery on orders above ₹199'
            : 'Mega Savings Week — extra 10% off with code SAVE10'}
        </div>
      </div>

      {/* main bar — dark, boxed */}
      <div className='bg-royal-950'>
        <div className='mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-6'>
          <div className='flex items-center gap-2.5 py-3 sm:gap-4'>
            {/* logo */}
            <Link to='/' className='flex shrink-0 items-center gap-2'>
              <motion.span
                whileHover={{ rotate: -8, scale: 1.06 }}
                className='grid h-9 w-9 place-items-center rounded-full bg-olive-500 font-display text-lg font-extrabold text-white shadow-glow-olive'
              >
                m
              </motion.span>
              <span className='hidden font-display text-[18px] font-extrabold tracking-tight text-white min-[400px]:block'>
                <span className='text-olive-400'>m</span>COM
              </span>
            </Link>

            {/* Dash — quick commerce entry */}
            <Link
              to={onQuick ? '/' : '/quick'}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors ${
                onQuick
                  ? 'bg-olive-500 text-white shadow-glow-olive'
                  : 'text-white/70 ring-1 ring-white/20 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Zap className='h-3.5 w-3.5' strokeWidth={2.4} />
              <span className='hidden sm:inline'>Dash</span>
            </Link>

            {/* search (desktop) */}
            <div className='hidden min-w-0 flex-1 md:block'>
              <SearchBox />
            </div>
            <div className='flex-1 md:hidden' />

            {/* location hint */}
            <div className='hidden shrink-0 items-center gap-1.5 text-[12px] text-white/50 xl:flex'>
              <MapPin className='h-4 w-4 text-olive-400' strokeWidth={2} />
              <span>
                Deliver to <span className='font-semibold text-white'>Kolkata 700029</span>
              </span>
            </div>

            {/* actions */}
            <nav className='flex shrink-0 items-center gap-1 sm:gap-2'>
              <UserMenu onLogin={() => setAuthOpen(true)} />

              <NavLink
                to='/wishlist'
                aria-label='Wishlist'
                className='relative hidden h-10 w-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:grid'
              >
                <Heart className='h-4.75 w-4.75' strokeWidth={2} />
                <CountBadge count={wishlist.count} tone='bg-rose-500' />
              </NavLink>

              <NavLink
                to='/cart'
                aria-label='Cart'
                className='relative flex items-center gap-1.5 rounded-full px-2.5 py-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white'
              >
                <span className='relative'>
                  <ShoppingCart className='h-4.75 w-4.75' strokeWidth={2} />
                  <CountBadge count={cart.count} />
                </span>
                <span className='hidden text-[12.5px] font-bold lg:inline'>Cart</span>
              </NavLink>
            </nav>
          </div>

          {/* mobile search row */}
          <div className='pb-3 md:hidden'>
            <SearchBox />
          </div>
        </div>
      </div>

      {/* category chip bar — shop pages only */}
      {!onQuick && <CategoryChips />}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Zap, Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

/** Mobile-only bottom tab bar with sliding active indicator. */
export default function BottomNav () {
  const cart = useCart()
  const wishlist = useWishlist()
  const { pathname } = useLocation()

  const tabs = [
    { to: '/', label: 'Shop', icon: Home, match: p => p === '/' || p.startsWith('/product') },
    { to: '/quick', label: 'Dash', icon: Zap, match: p => p.startsWith('/quick') },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, match: p => p.startsWith('/wishlist'), badge: wishlist.count },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, match: p => p.startsWith('/cart'), badge: cart.count }
  ]

  return (
    <nav className='fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/92 backdrop-blur-xl md:hidden'>
      <div className='grid grid-cols-4'>
        {tabs.map(t => {
          const active = t.match(pathname)
          return (
            <NavLink key={t.label} to={t.to} className='relative flex flex-col items-center gap-0.5 py-2.5'>
              {active && (
                <motion.span
                  layoutId='bottomnav-dot'
                  className='absolute top-0 h-0.5 w-8 rounded-full bg-royal-600'
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className='relative'>
                <t.icon
                  className={`h-5.25 w-5.25 ${active ? 'text-royal-600' : 'text-slate-400'}`}
                  strokeWidth={active ? 2.4 : 2}
                />
                {t.badge > 0 && (
                  <span className='absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-olive-500 px-1 text-[9px] font-bold text-white'>
                    {t.badge}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-semibold ${active ? 'text-royal-700' : 'text-slate-400'}`}>
                {t.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

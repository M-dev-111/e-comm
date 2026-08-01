import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import CartItemRow from '../components/cart/CartItemRow'
import CouponBox from '../components/cart/CouponBox'
import PriceSummary from '../components/cart/PriceSummary'
import EmptyState from '../components/ui/EmptyState'
import Container from '../components/ui/Container'
import { formatINR } from '../utils/format'

export default function CartPage () {
  const cart = useCart()
  const navigate = useNavigate()

  if (cart.isLoading) {
    return <div className='min-h-[60vh]' />
  }

  if (cart.lines.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title='Your cart is empty'
        sub='Items you add to your cart will appear here.'
        cta='Continue shopping'
        to='/'
      />
    )
  }

  return (
    <Container className='py-6 pb-32 lg:pb-10'>
      <h1 className='font-display text-2xl font-bold tracking-tight text-slate-900'>
        My Cart <span className='text-[15px] font-semibold text-slate-400'>({cart.count} items)</span>
      </h1>

      <div className='mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]'>
        {/* items */}
        <div className='space-y-3'>
          <AnimatePresence mode='popLayout'>
            {cart.lines.map(line => (
              <CartItemRow key={line.key} line={line} />
            ))}
          </AnimatePresence>
        </div>

        {/* summary rail */}
        <div className='space-y-4 lg:sticky lg:top-44 lg:self-start'>
          <CouponBox />
          <PriceSummary />

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/checkout')}
            className='hidden w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-royal-700 to-royal-500 py-4 text-[14px] font-bold text-white shadow-glow-royal transition-transform hover:-translate-y-0.5 lg:flex'
          >
            Proceed to Checkout <ArrowRight className='h-4.5 w-4.5' strokeWidth={2.2} />
          </motion.button>

          <p className='flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400'>
            <ShieldCheck className='h-3.5 w-3.5 text-olive-600' />
            Safe and secure payments · 100% authentic products
          </p>
        </div>
      </div>

      {/* mobile checkout bar */}
      <div className='fixed inset-x-0 bottom-14.25 z-40 flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-3 md:bottom-0 lg:hidden'>
        <div>
          <p className='text-[11px] text-slate-400 line-through'>{formatINR(cart.mrpTotal)}</p>
          <p className='font-display text-[17px] font-extrabold text-slate-900'>{formatINR(cart.total)}</p>
        </div>
        <Link
          to='/checkout'
          className='flex items-center gap-2 rounded-xl bg-linear-to-r from-royal-700 to-royal-500 px-6 py-3 text-[13px] font-bold text-white shadow-glow-royal'
        >
          Checkout <ArrowRight className='h-4 w-4' />
        </Link>
      </div>
    </Container>
  )
}

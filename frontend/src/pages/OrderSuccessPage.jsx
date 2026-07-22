import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Home, MapPin, PackageCheck } from 'lucide-react'
import { formatINR } from '../utils/format'
import Container from '../components/ui/Container'

const CONFETTI_COLORS = ['#4667e5', '#8da336', '#abbe52', '#6b8bee', '#c5d27b', '#f59e0b']

/* hand-rolled confetti burst — 40 pieces, transform-only animation */
function Confetti () {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: (i / 40) * 100 + (i % 3) * 2 - 3,
        delay: (i % 10) * 0.09,
        duration: 2.6 + (i % 5) * 0.35,
        size: 6 + (i % 4) * 3,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: (i % 2 ? 1 : -1) * (360 + i * 24),
        drift: ((i % 7) - 3) * 30
      })),
    []
  )

  return (
    <div aria-hidden className='pointer-events-none fixed inset-0 z-0 overflow-hidden'>
      {pieces.map(p => (
        <motion.span
          key={p.id}
          initial={{ y: -40, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', x: p.drift, rotate: p.rotate, opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.45,
            backgroundColor: p.color,
            borderRadius: 2
          }}
          className='absolute top-0'
        />
      ))}
    </div>
  )
}

export default function OrderSuccessPage () {
  const order = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('mcom.lastOrder'))
    } catch {
      return null
    }
  }, [])

  if (!order) return <Navigate to='/' replace />

  return (
    <Container className='relative py-14'>
      <Confetti />

      <div className='relative z-10 mx-auto max-w-xl text-center'>
        {/* tick */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          className='relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-linear-to-br from-olive-500 to-olive-700 shadow-glow-olive'
        >
          <span className='absolute inset-0 rounded-full bg-olive-400/40 animate-pulse-ring' />
          <Check className='h-12 w-12 text-white' strokeWidth={3} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className='mt-7 font-display text-[clamp(26px,4vw,40px)] font-extrabold tracking-tight text-slate-900'
        >
          Order confirmed
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className='mt-2 text-[14.5px] text-slate-500'
        >
          Thank you for shopping with mCOM. A confirmation email is on its way to your inbox.
        </motion.p>

        {/* order card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className='mt-8 overflow-hidden rounded-3xl border border-slate-100 bg-white text-left shadow-card-hover'
        >
          <div className='flex items-center justify-between bg-royal-950 px-6 py-4 text-white'>
            <div>
              <p className='text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/50'>Order ID</p>
              <p className='font-display text-[15px] font-bold tracking-wide'>{order.id}</p>
            </div>
            <PackageCheck className='h-7 w-7 text-olive-300' strokeWidth={1.8} />
          </div>

          <div className='space-y-3.5 px-6 py-5'>
            <div className='flex justify-between text-[13.5px]'>
              <span className='text-slate-500'>Items</span>
              <span className='font-semibold text-slate-800'>{order.count}</span>
            </div>
            <div className='flex justify-between text-[13.5px]'>
              <span className='text-slate-500'>Paid via</span>
              <span className='font-semibold text-slate-800'>{order.payment}</span>
            </div>
            <div className='flex justify-between text-[13.5px]'>
              <span className='text-slate-500'>Amount paid</span>
              <span className='font-display text-[16px] font-extrabold text-slate-900'>{formatINR(order.total)}</span>
            </div>
            {order.savings > 0 && (
              <div className='flex justify-between rounded-xl bg-olive-50 px-3.5 py-2.5 text-[13px] font-bold text-olive-700'>
                <span>Total savings</span>
                <span>{formatINR(order.savings)}</span>
              </div>
            )}
            <div className='flex items-start gap-2 border-t border-dashed border-slate-200 pt-3.5 text-[12.5px] text-slate-500'>
              <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-royal-600' />
              <span>
                Arriving by <span className='font-bold text-slate-800'>{order.eta}</span> at {order.address.line1},{' '}
                {order.address.city} — {order.address.pincode}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className='mt-8 flex flex-wrap items-center justify-center gap-3'
        >
          <Link
            to='/'
            className='flex items-center gap-2 rounded-full bg-royal-600 px-6 py-3 text-[13px] font-bold text-white shadow-glow-royal transition-transform hover:-translate-y-0.5'
          >
            <Home className='h-4 w-4' /> Continue shopping
          </Link>
          <Link
            to='/orders'
            className='flex items-center gap-2 rounded-full border border-royal-200 bg-royal-50 px-6 py-3 text-[13px] font-bold text-royal-700 transition-colors hover:bg-royal-100'
          >
            <PackageCheck className='h-4 w-4' strokeWidth={2} /> Track this order
          </Link>
          <Link
            to='/quick'
            className='flex items-center gap-2 rounded-full border border-olive-300 bg-olive-50 px-6 py-3 text-[13px] font-bold text-olive-700 transition-colors hover:bg-olive-100'
          >
            Shop groceries on Dash
          </Link>
        </motion.div>
      </div>
    </Container>
  )
}

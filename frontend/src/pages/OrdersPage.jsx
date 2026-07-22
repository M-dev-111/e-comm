import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Package } from 'lucide-react'
import { useOrders } from '../context/OrdersContext'
import { useAuth } from '../context/AuthContext'
import OrderCard from '../components/orders/OrderCard'
import EmptyState from '../components/ui/EmptyState'
import Container from '../components/ui/Container'
import AuthModal from '../components/auth/AuthModal'
import { EASE } from '../utils/motion'
import { toast } from 'sonner'

const FILTERS = [
  { id: 'all', label: 'All orders' },
  { id: 'active', label: 'In progress' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' }
]

const matchesFilter = (order, filter) => {
  if (filter === 'all') return true
  if (filter === 'active') return order.status !== 'delivered' && order.status !== 'cancelled'
  return order.status === filter
}

export default function OrdersPage () {
  const { orders, cancelOrder } = useOrders()
  const auth = useAuth()
  const [filter, setFilter] = useState('all')
  const [authOpen, setAuthOpen] = useState(false)

  const visible = useMemo(() => orders.filter(o => matchesFilter(o, filter)), [orders, filter])

  const counts = useMemo(
    () =>
      FILTERS.reduce((acc, f) => {
        acc[f.id] = orders.filter(o => matchesFilter(o, f.id)).length
        return acc
      }, {}),
    [orders]
  )

  const handleCancel = id => {
    cancelOrder(id)
    toast.info('Order cancelled')
  }

  if (!auth.user) {
    return (
      <Container className='py-20'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className='mx-auto max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-card'
        >
          <span className='mx-auto grid h-16 w-16 place-items-center rounded-full bg-royal-50'>
            <Lock className='h-7 w-7 text-royal-500' strokeWidth={1.8} />
          </span>
          <h1 className='mt-5 font-display text-xl font-bold text-slate-900'>Login to see your orders</h1>
          <p className='mt-2 text-[13px] leading-relaxed text-slate-500'>
            Your order history, tracking and invoices live here once you are signed in.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className='mt-6 w-full rounded-xl bg-royal-600 py-3.5 text-[13.5px] font-bold text-white shadow-glow-royal transition-colors hover:bg-royal-700'
          >
            Login to continue
          </button>
        </motion.div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </Container>
    )
  }

  if (!orders.length) {
    return (
      <EmptyState
        icon={Package}
        title='No orders yet'
        sub='Once you place an order it will show up here with live tracking.'
        cta='Start shopping'
        to='/'
      />
    )
  }

  return (
    <Container className='py-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='font-display text-2xl font-bold tracking-tight text-slate-900'>My Orders</h1>
          <p className='mt-0.5 text-[12.5px] text-slate-400'>
            {orders.length} order{orders.length === 1 ? '' : 's'} placed with mCOM
          </p>
        </div>
      </div>

      {/* filters */}
      <div className='no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1'>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`relative shrink-0 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
              filter === f.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter === f.id && (
              <motion.span
                layoutId='orders-filter-pill'
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className='absolute inset-0 rounded-full bg-royal-600 shadow-glow-royal'
              />
            )}
            <span className='relative z-10'>
              {f.label} ({counts[f.id] ?? 0})
            </span>
          </button>
        ))}
      </div>

      {/* list */}
      <motion.div layout className='mt-5 space-y-4'>
        <AnimatePresence mode='popLayout'>
          {visible.length ? (
            visible.map(order => <OrderCard key={order.id} order={order} onCancel={handleCancel} />)
          ) : (
            <motion.p
              key='none'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='rounded-2xl border border-dashed border-slate-200 py-16 text-center text-[13px] text-slate-400'
            >
              No orders in this state.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  )
}

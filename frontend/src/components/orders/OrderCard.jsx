import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, MapPin, RotateCcw, Truck, X } from 'lucide-react'
import Img from '../ui/Img'
import OrderStatusTrail from './OrderStatusTrail'
import { STATUS_LABELS } from '../../data/orderStatus'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { formatINR } from '../../utils/format'

const STATUS_STYLES = {
  delivered: 'bg-olive-50 text-olive-700',
  cancelled: 'bg-rose-50 text-rose-600',
  default: 'bg-royal-50 text-royal-700'
}

const formatDate = iso =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const etaLabel = order => {
  if (order.status === 'delivered') return `Delivered on ${formatDate(order.placedAt)}`
  if (order.status === 'cancelled') return 'Order cancelled'
  const eta = new Date(order.placedAt)
  eta.setDate(eta.getDate() + (order.etaDays ?? 3))
  return `Arriving by ${eta.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`
}

export default function OrderCard ({ order, onCancel }) {
  const [open, setOpen] = useState(false)
  const cart = useCart()
  const toast = useToast()

  const badge = STATUS_STYLES[order.status] || STATUS_STYLES.default
  const canCancel = order.status !== 'delivered' && order.status !== 'cancelled'

  const buyAgain = () => {
    order.items.forEach(item => cart.add(item.id, { size: item.size, color: item.color, qty: item.qty }))
    toast(`${order.items.length} item${order.items.length > 1 ? 's' : ''} added to cart`)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card'
    >
      {/* summary row */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3'>
        <div className='min-w-0'>
          <p className='font-display text-[13px] font-bold text-slate-900'>{order.id}</p>
          <p className='text-[11.5px] text-slate-400'>Placed on {formatDate(order.placedAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${badge}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* items */}
      <div className='space-y-3 px-4 py-3.5'>
        {order.items.map(item => (
          <div key={`${item.id}-${item.size}-${item.color}`} className='flex items-center gap-3'>
            <Link to={`/product/${item.id}`} className='shrink-0'>
              <Img src={item.image} alt={item.name} className='h-14 w-14 rounded-lg' />
            </Link>
            <div className='min-w-0 flex-1'>
              <Link
                to={`/product/${item.id}`}
                className='clamp-1 text-[13px] font-semibold text-slate-800 transition-colors hover:text-royal-700'
              >
                {item.name}
              </Link>
              <p className='text-[11.5px] text-slate-400'>
                Qty {item.qty}
                {[item.color, item.size].filter(Boolean).map(v => ` · ${v}`).join('')}
              </p>
            </div>
            <span className='text-[13px] font-bold text-slate-900'>{formatINR(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      {/* footer */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3'>
        <p className='flex items-center gap-1.5 text-[12px] font-semibold text-slate-600'>
          <Truck className='h-4 w-4 text-royal-500' strokeWidth={2} />
          {etaLabel(order)}
        </p>
        <div className='flex items-center gap-2'>
          <span className='font-display text-[15px] font-extrabold text-slate-900'>{formatINR(order.total)}</span>
          <button
            onClick={() => setOpen(v => !v)}
            className='flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-royal-600 transition-colors hover:bg-royal-50'
          >
            Details
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* expanded detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className='overflow-hidden border-t border-slate-100'
          >
            <div className='space-y-4 px-4 py-4'>
              <OrderStatusTrail status={order.status} />

              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <p className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400'>
                    <MapPin className='h-3.5 w-3.5 text-royal-500' /> Delivery address
                  </p>
                  <p className='mt-1.5 text-[12.5px] font-semibold text-slate-800'>{order.address.name}</p>
                  <p className='text-[12px] leading-relaxed text-slate-500'>
                    {order.address.line1}, {order.address.city} — {order.address.pincode}
                  </p>
                </div>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <p className='text-[11px] font-bold uppercase tracking-wide text-slate-400'>Payment</p>
                  <p className='mt-1.5 text-[12.5px] font-semibold text-slate-800'>{order.payment}</p>
                  {order.savings > 0 && (
                    <p className='text-[12px] font-bold text-olive-600'>You saved {formatINR(order.savings)}</p>
                  )}
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={buyAgain}
                  className='flex items-center gap-1.5 rounded-xl bg-royal-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-glow-royal transition-colors hover:bg-royal-700'
                >
                  <RotateCcw className='h-3.5 w-3.5' strokeWidth={2.4} /> Buy again
                </button>
                {canCancel && (
                  <button
                    onClick={() => onCancel(order.id)}
                    className='flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[12.5px] font-bold text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600'
                  >
                    <X className='h-3.5 w-3.5' strokeWidth={2.6} /> Cancel order
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

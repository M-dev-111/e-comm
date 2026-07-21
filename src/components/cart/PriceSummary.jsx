import { motion } from 'framer-motion'
import { BadgePercent } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatINR } from '../../utils/format'
import { DELIVERY } from '../../data/data'

/** Right-rail price breakdown — used on Cart and Checkout. */
export default function PriceSummary ({ compact = false }) {
  const cart = useCart()

  const toFree = DELIVERY.freeAbove - cart.priceTotal
  const progress = Math.min(100, (cart.priceTotal / DELIVERY.freeAbove) * 100)

  const rows = [
    // quantity-weighted here so the arithmetic reads correctly
    [`Price (${cart.units} item${cart.units > 1 ? 's' : ''})`, formatINR(cart.mrpTotal)],
    ['Product discount', `− ${formatINR(cart.productDiscount)}`, 'text-olive-600'],
    ...(cart.couponDiscount > 0 ? [[`Coupon (${cart.coupon.code})`, `− ${formatINR(cart.couponDiscount)}`, 'text-olive-600']] : []),
    ['Delivery fee', cart.deliveryFee === 0 ? 'FREE' : formatINR(cart.deliveryFee), cart.deliveryFee === 0 ? 'text-olive-600 font-bold' : ''],
    ['Platform fee', formatINR(cart.platformFee)]
  ]

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card'>
      <p className='border-b border-slate-100 px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-slate-400'>
        Price details
      </p>

      <div className='space-y-3 px-5 py-4'>
        {rows.map(([label, value, cls = '']) => (
          <div key={label} className='flex items-center justify-between text-[13.5px]'>
            <span className='text-slate-600'>{label}</span>
            <span className={`font-semibold text-slate-800 ${cls}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className='flex items-center justify-between border-t border-dashed border-slate-200 px-5 py-4'>
        <span className='font-display text-[15px] font-bold text-slate-900'>Total amount</span>
        <span className='font-display text-4.5 font-extrabold text-slate-900'>{formatINR(cart.total)}</span>
      </div>

      {cart.savings > 0 && (
        <div className='flex items-center gap-2 bg-olive-50 px-5 py-3 text-[12.5px] font-bold text-olive-700'>
          <BadgePercent className='h-4 w-4' strokeWidth={2.2} />
          You save {formatINR(cart.savings)} on this order
        </div>
      )}

      {!compact && toFree > 0 && (
        <div className='border-t border-slate-100 px-5 py-3.5'>
          <p className='text-[12px] text-slate-500'>
            Add <span className='font-bold text-royal-600'>{formatINR(toFree)}</span> more for FREE delivery
          </p>
          <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className='h-full rounded-full bg-linear-to-r from-royal-500 to-olive-500'
            />
          </div>
        </div>
      )}
    </div>
  )
}

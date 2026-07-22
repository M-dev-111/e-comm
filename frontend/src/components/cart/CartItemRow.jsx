import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Zap } from 'lucide-react'
import Img from '../ui/Img'
import QuantityStepper from '../ui/QuantityStepper'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { formatINR, discountPct } from '../../utils/format'

export default function CartItemRow ({ line }) {
  const cart = useCart()
  const toast = useToast()
  const p = line.product
  const isQuick = p.id.startsWith('q')
  const image = isQuick ? p.image : p.images[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
      className='flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card'
    >
      <Link to={isQuick ? '/quick' : `/product/${p.id}`} className='shrink-0'>
        <Img src={image} alt={p.name} className='h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28' />
      </Link>

      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400'>
              {isQuick ? (
                <span className='inline-flex items-center gap-1 rounded bg-olive-50 px-1.5 py-0.5 text-[10px] font-bold text-olive-700'>
                  <Zap className='h-2.5 w-2.5' /> Minutes · {p.eta} min
                </span>
              ) : (
                p.brand
              )}
            </p>
            <Link
              to={isQuick ? '/quick' : `/product/${p.id}`}
              className='clamp-2 mt-0.5 text-[14px] font-semibold leading-snug text-slate-800 transition-colors hover:text-royal-700'
            >
              {p.name}
            </Link>
            {(line.size || line.color) && (
              <p className='mt-1 text-[12px] text-slate-400'>
                {[line.color, line.size].filter(Boolean).join(' · ')}
              </p>
            )}
            {isQuick && <p className='mt-1 text-[12px] text-slate-400'>{p.unit}</p>}
          </div>

          <button
            aria-label='Remove item'
            onClick={() => {
              cart.remove(line.key)
              toast('Removed from cart', 'remove')
            }}
            className='grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500'
          >
            <Trash2 className='h-4 w-4' strokeWidth={2} />
          </button>
        </div>

        <div className='mt-auto flex flex-wrap items-end justify-between gap-3 pt-3'>
          <div className='flex items-baseline gap-2'>
            <span className='font-display text-[16px] font-bold text-slate-900'>{formatINR(p.price * line.qty)}</span>
            {p.mrp > p.price && (
              <>
                <span className='text-[12px] text-slate-400 line-through'>{formatINR(p.mrp * line.qty)}</span>
                <span className='text-[12px] font-bold text-olive-600'>{discountPct(p.mrp, p.price)}% off</span>
              </>
            )}
          </div>
          <QuantityStepper size='sm' qty={line.qty} onChange={n => cart.setQty(line.key, n)} tone={isQuick ? 'olive' : 'royal'} />
        </div>
      </div>
    </motion.div>
  )
}

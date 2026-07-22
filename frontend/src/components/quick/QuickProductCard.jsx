import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import Img from '../ui/Img'
import QuantityStepper from '../ui/QuantityStepper'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { formatINR, discountPct } from '../../utils/format'
import { fadeUp } from '../../utils/motion'

/** Compact grocery card — ADD button morphs into a quantity stepper. */
export default function QuickProductCard ({ product, index = 0 }) {
  const cart = useCart()
  const toast = useToast()
  const qty = cart.qtyOf(product.id)
  const lineKey = cart.keyFor(product.id, null, null)

  return (
    <motion.article
      variants={fadeUp}
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: (index % 6) * 0.04 }}
      className='flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover'
    >
      <div className='relative overflow-hidden rounded-xl bg-slate-50'>
        <Img src={product.image} alt={product.name} className='aspect-square w-full object-cover' />
        {product.tag && (
          <span className='absolute left-2 top-2 rounded-md bg-olive-600 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white'>
            {product.tag}
          </span>
        )}
        <span className='absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-olive-700 backdrop-blur'>
          <Clock className='h-2.5 w-2.5' strokeWidth={2.6} /> {product.eta} min
        </span>
      </div>

      <div className='mt-2.5 flex flex-1 flex-col'>
        <p className='text-[10.5px] font-semibold uppercase tracking-wide text-slate-400'>{product.unit}</p>
        <h3 className='clamp-2 mt-0.5 min-h-[2.75em] text-[13px] font-semibold leading-snug text-slate-800'>{product.name}</h3>

        <div className='mt-auto flex items-end justify-between gap-2 pt-2.5'>
          <div>
            <p className='text-[14.5px] font-bold text-slate-900'>{formatINR(product.price)}</p>
            {product.mrp > product.price && (
              <p className='text-[10.5px] text-slate-400'>
                <span className='line-through'>{formatINR(product.mrp)}</span>{' '}
                <span className='font-bold text-olive-600'>{discountPct(product.mrp, product.price)}%</span>
              </p>
            )}
          </div>

          <AnimatePresence mode='popLayout' initial={false}>
            {qty === 0 ? (
              <motion.button
                key='add'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  cart.add(product.id)
                  toast(`${product.name} added`)
                }}
                className='rounded-xl border border-olive-600 bg-olive-50 px-4 py-2 text-[12px] font-extrabold uppercase tracking-wide text-olive-700 transition-colors hover:bg-olive-600 hover:text-white'
              >
                Add
              </motion.button>
            ) : (
              <motion.div
                key='stepper'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <QuantityStepper size='sm' tone='olive' qty={qty} onChange={n => cart.setQty(lineKey, n)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  )
}

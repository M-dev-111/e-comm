import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

/** − qty + control with a little pop on change. */
export default function QuantityStepper ({ qty, onChange, min = 0, max = 10, size = 'md', tone = 'royal' }) {
  const h = size === 'sm' ? 'h-8' : 'h-10'
  const toneCls =
    tone === 'olive'
      ? 'border-olive-600 text-olive-700'
      : 'border-royal-600 text-royal-700'

  return (
    <div className={`inline-flex items-center overflow-hidden rounded-xl border bg-white ${toneCls} ${h}`}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        aria-label='Decrease quantity'
        onClick={() => onChange(Math.max(min, qty - 1))}
        className='grid h-full w-8 place-items-center transition-colors hover:bg-slate-50'
      >
        <Minus className='h-3.5 w-3.5' strokeWidth={2.4} />
      </motion.button>

      <span className='relative grid w-8 place-items-center overflow-hidden text-[13px] font-bold'>
        <AnimatePresence mode='popLayout' initial={false}>
          <motion.span
            key={qty}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {qty}
          </motion.span>
        </AnimatePresence>
      </span>

      <motion.button
        whileTap={{ scale: 0.85 }}
        aria-label='Increase quantity'
        onClick={() => onChange(Math.min(max, qty + 1))}
        className='grid h-full w-8 place-items-center transition-colors hover:bg-slate-50'
      >
        <Plus className='h-3.5 w-3.5' strokeWidth={2.4} />
      </motion.button>
    </div>
  )
}

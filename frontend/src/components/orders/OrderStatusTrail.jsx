import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { ORDER_STATUSES, STATUS_LABELS } from '../../data/orderStatus'

/** Horizontal progress trail through the fulfilment stages. */
export default function OrderStatusTrail ({ status }) {
  if (status === 'cancelled') {
    return (
      <div className='flex items-center gap-2.5 rounded-xl bg-rose-50 px-4 py-3'>
        <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-500 text-white'>
          <X className='h-4 w-4' strokeWidth={3} />
        </span>
        <div>
          <p className='text-[13px] font-bold text-rose-700'>Order cancelled</p>
          <p className='text-[11.5px] text-rose-500'>Any amount paid is refunded in 3–5 business days.</p>
        </div>
      </div>
    )
  }

  const currentIndex = ORDER_STATUSES.indexOf(status)

  return (
    <div className='flex items-start'>
      {ORDER_STATUSES.map((stage, i) => {
        const done = i <= currentIndex
        const isCurrent = i === currentIndex
        return (
          <div key={stage} className='flex min-w-0 flex-1 flex-col items-center'>
            <div className='flex w-full items-center'>
              <span className={`h-0.5 flex-1 ${i === 0 ? 'bg-transparent' : done ? 'bg-olive-500' : 'bg-slate-200'}`} />
              <motion.span
                initial={false}
                animate={isCurrent ? { scale: [1, 1.18, 1] } : {}}
                transition={{ duration: 0.5 }}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  done ? 'border-olive-500 bg-olive-500 text-white' : 'border-slate-200 bg-white text-slate-300'
                }`}
              >
                {done ? <Check className='h-3 w-3' strokeWidth={3.5} /> : <span className='h-1.5 w-1.5 rounded-full bg-current' />}
              </motion.span>
              <span
                className={`h-0.5 flex-1 ${
                  i === ORDER_STATUSES.length - 1 ? 'bg-transparent' : i < currentIndex ? 'bg-olive-500' : 'bg-slate-200'
                }`}
              />
            </div>
            <span
              className={`mt-1.5 text-center text-[9.5px] font-semibold leading-tight sm:text-[10.5px] ${
                done ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {STATUS_LABELS[stage]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

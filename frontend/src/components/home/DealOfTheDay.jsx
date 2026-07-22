import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'
import { PRODUCTS } from '../../data/data'
import useCountdown from '../../hooks/useCountdown'
import ProductCard from '../product/ProductCard'
import Container from '../ui/Container'

/* flip-style digit pair */
function TimeCell ({ value, label }) {
  return (
    <div className='flex flex-col items-center gap-1'>
      <div className='relative grid h-10 w-11 place-items-center overflow-hidden rounded-lg bg-royal-950 font-display text-[17px] font-bold text-white shadow-inner'>
        <AnimatePresence mode='popLayout' initial={false}>
          <motion.span
            key={value}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className='text-[9.5px] font-bold uppercase tracking-widest text-slate-400'>{label}</span>
    </div>
  )
}

export default function DealOfTheDay () {
  const { h, m, s } = useCountdown()
  const deals = PRODUCTS.filter(p => p.tags.includes('deal'))

  return (
    <section className='w-full bg-linear-to-b from-white to-royal-50/50 py-10'>
      <Container>
        <div className='mb-5 flex flex-wrap items-end justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <span className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-olive-500 to-olive-700 text-white shadow-glow-olive'>
              <Flame className='h-6 w-6' strokeWidth={2} />
            </span>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-olive-600'>Ends at midnight</p>
              <h2 className='font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>
                Deal of the Day
              </h2>
            </div>
          </div>

          <div className='flex items-center gap-1.5'>
            <TimeCell value={h} label='hrs' />
            <span className='pb-5 font-bold text-slate-300'>:</span>
            <TimeCell value={m} label='min' />
            <span className='pb-5 font-bold text-slate-300'>:</span>
            <TimeCell value={s} label='sec' />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6'>
          {deals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  )
}

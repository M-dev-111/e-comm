import { motion } from 'framer-motion'
import { BadgePercent, Landmark, Ticket } from 'lucide-react'
import { stagger, fadeUp } from '../../utils/motion'
import Container from '../ui/Container'

const OFFERS = [
  { icon: Ticket, code: 'SAVE10', sub: '10% off up to ₹500 on orders above ₹1,499' },
  { icon: BadgePercent, code: 'WELCOME100', sub: '₹100 off your first order above ₹999' },
  { icon: Landmark, title: 'Bank offer', sub: '10% instant discount with partner bank cards' }
]

/** Slim row of offer cards — apply codes in the cart. */
export default function OfferStrip () {
  return (
    <Container className='pt-3'>
      <motion.div
        variants={stagger(0.08)}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true }}
        className='grid grid-cols-1 gap-3 sm:grid-cols-3'
      >
        {OFFERS.map(o => (
          <motion.div
            key={o.code || o.title}
            variants={fadeUp}
            className='flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-card'
          >
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-olive-50 text-olive-700'>
              <o.icon className='h-4.5 w-4.5' strokeWidth={2} />
            </span>
            <div className='min-w-0'>
              {o.code ? (
                <span className='inline-block rounded-md border border-dashed border-royal-300 bg-royal-50 px-2 py-0.5 font-display text-[11.5px] font-bold tracking-widest text-royal-700'>
                  {o.code}
                </span>
              ) : (
                <p className='text-[13px] font-bold text-slate-900'>{o.title}</p>
              )}
              <p className='clamp-1 mt-1 text-[11.5px] text-slate-500'>{o.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Container>
  )
}

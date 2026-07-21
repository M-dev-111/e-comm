import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeUp } from '../../utils/motion'

export default function SectionHeader ({ kicker, title, to, cta = 'View all' }) {
  return (
    <motion.div
      variants={fadeUp}
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, margin: '-40px' }}
      className='mb-5 flex items-end justify-between gap-4'
    >
      <div>
        {kicker && (
          <p className='mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-royal-500'>{kicker}</p>
        )}
        <h2 className='font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>{title}</h2>
      </div>
      {to && (
        <Link
          to={to}
          className='group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-royal-50 px-4 py-2 text-[12px] font-semibold text-royal-700 transition-colors hover:bg-royal-600 hover:text-white'
        >
          {cta}
          <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
        </Link>
      )}
    </motion.div>
  )
}

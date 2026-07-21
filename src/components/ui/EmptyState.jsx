import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

export default function EmptyState ({ icon: Icon = ShoppingBag, title, sub, cta = 'Start shopping', to = '/' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center py-24 text-center'
    >
      <span className='grid h-20 w-20 place-items-center rounded-full bg-royal-50'>
        <Icon className='h-9 w-9 text-royal-400' strokeWidth={1.5} />
      </span>
      <h3 className='mt-6 font-display text-xl font-bold text-slate-900'>{title}</h3>
      {sub && <p className='mt-2 max-w-sm text-sm text-slate-500'>{sub}</p>}
      <Link
        to={to}
        className='mt-6 rounded-full bg-royal-600 px-6 py-3 text-[13px] font-semibold text-white shadow-glow-royal transition-transform hover:-translate-y-0.5'
      >
        {cta}
      </Link>
    </motion.div>
  )
}

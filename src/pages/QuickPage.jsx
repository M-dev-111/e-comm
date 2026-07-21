import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Bike, Clock3, Leaf, ShoppingBag, Sparkles } from 'lucide-react'
import { QUICK_CATEGORIES, QUICK_PRODUCTS, DELIVERY } from '../data/data'
import QuickProductCard from '../components/quick/QuickProductCard'
import Container from '../components/ui/Container'
import Img from '../components/ui/Img'
import { useCart } from '../context/CartContext'
import { formatINR } from '../utils/format'
import { EASE } from '../utils/motion'

function QuickHero () {
  return (
    <section className='relative w-full overflow-hidden bg-linear-to-br from-olive-900 via-olive-800 to-olive-950'>
      {/* produce imagery so the hero is never a flat color block */}
      <Img
        src='https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=80'
        alt=''
        className='absolute inset-y-0 right-0 h-full w-full object-cover opacity-35 mask-[linear-gradient(to_left,black_45%,transparent)] lg:w-3/5'
      />
      <div aria-hidden className='pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-olive-500/20 blur-3xl' />
      <div aria-hidden className='pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-royal-500/15 blur-3xl' />

      <Container className='relative z-10 py-12 sm:py-16'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className='max-w-2xl'
        >
          <p className='inline-flex items-center gap-2 rounded-full border border-olive-400/40 bg-olive-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-olive-200'>
            <Sparkles className='h-3.5 w-3.5' /> Bazario Dash
          </p>
          <h1 className='mt-4 font-display text-[clamp(30px,5vw,56px)] font-extrabold leading-[1.04] tracking-tight text-white'>
            Groceries in{' '}
            <span className='relative inline-block text-olive-300'>
              8 minutes
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
                className='absolute -bottom-1 left-0 h-1.5 w-full origin-left rounded-full bg-olive-400/60'
              />
            </span>
            .<br />
            Delivered fresh.
          </h1>
          <p className='mt-4 max-w-md text-[14.5px] leading-relaxed text-white/60'>
            Fresh produce, dairy, snacks and daily essentials — picked from a store near you and
            delivered to your door in minutes.
          </p>

          <div className='mt-7 flex flex-wrap items-center gap-5'>
            {[
              { icon: Clock3, label: 'Avg. delivery 8 min' },
              { icon: Leaf, label: 'Farm-fresh daily' },
              { icon: Bike, label: `Free above ${formatINR(DELIVERY.quickFreeAbove)}` }
            ].map(f => (
              <span key={f.label} className='flex items-center gap-2 text-[12.5px] font-semibold text-white/80'>
                <span className='relative grid h-9 w-9 place-items-center rounded-full bg-white/10'>
                  <span className='absolute inset-0 rounded-full bg-olive-400/30 animate-pulse-ring' />
                  <f.icon className='h-4 w-4 text-olive-300' strokeWidth={2.2} />
                </span>
                {f.label}
              </span>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

export default function QuickPage () {
  const [cat, setCat] = useState('all')
  const cart = useCart()

  const products = useMemo(
    () => (cat === 'all' ? QUICK_PRODUCTS : QUICK_PRODUCTS.filter(p => p.category === cat)),
    [cat]
  )

  const quickLines = cart.lines.filter(l => l.id.startsWith('q'))
  const quickTotal = quickLines.reduce((a, l) => a + l.product.price * l.qty, 0)
  const quickCount = quickLines.reduce((a, l) => a + l.qty, 0)

  return (
    <>
      <QuickHero />

      {/* sticky category pills */}
      <div className='sticky top-34.75 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-xl md:top-21.75'>
        <Container>
          <div className='no-scrollbar flex gap-2 overflow-x-auto py-3'>
            {QUICK_CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-[12.5px] font-bold transition-colors ${
                  cat === c.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === c.id && (
                  <motion.span
                    layoutId='quick-cat-pill'
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className='absolute inset-0 rounded-full bg-linear-to-r from-olive-700 to-olive-500 shadow-glow-olive'
                  />
                )}
                <span className='relative z-10'>{c.label}</span>
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* grid */}
      <Container className='py-6 pb-28'>
        <motion.div layout className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 2xl:grid-cols-6'>
          <AnimatePresence mode='popLayout'>
            {products.map((p, i) => (
              <motion.div
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.28 }}
              >
                <QuickProductCard product={p} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>

      {/* floating basket bar */}
      <AnimatePresence>
        {quickCount > 0 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className='fixed inset-x-3 bottom-17.5 z-40 sm:inset-x-auto sm:right-8 sm:w-96 md:bottom-6'
          >
            <Link
              to='/cart'
              className='flex items-center justify-between rounded-2xl bg-linear-to-r from-olive-700 to-olive-600 px-5 py-4 text-white shadow-2xl shadow-olive-900/40 transition-transform hover:-translate-y-0.5'
            >
              <span className='flex items-center gap-3'>
                <span className='relative grid h-10 w-10 place-items-center rounded-xl bg-white/15'>
                  <ShoppingBag className='h-5 w-5' strokeWidth={2.2} />
                </span>
                <span>
                  <span className='block text-[11px] font-semibold uppercase tracking-wide text-white/70'>
                    {quickCount} item{quickCount > 1 ? 's' : ''} · arriving in ~8 min
                  </span>
                  <span className='font-display text-[16px] font-extrabold'>{formatINR(quickTotal)}</span>
                </span>
              </span>
              <span className='flex items-center gap-1 text-[13px] font-bold'>
                View basket <ArrowRight className='h-4 w-4' />
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

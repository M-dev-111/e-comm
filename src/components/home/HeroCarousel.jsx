import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { HERO_SLIDES, PROMO_TILES } from '../../data/data'
import { EASE } from '../../utils/motion'
import Img from '../ui/Img'
import Container from '../ui/Container'

const AUTOPLAY_MS = 5000
const SIDE_TILES = PROMO_TILES.slice(0, 2)

/**
 * Bento hero — one large auto-rotating feature panel plus two stacked
 * promo cards. An asymmetric layout with its own identity, fluid to 320px.
 */
export default function HeroCarousel () {
  const [index, setIndex] = useState(0)
  const slide = HERO_SLIDES[index]

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % HERO_SLIDES.length), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [])

  return (
    <Container className='pt-4'>
      <div className='grid gap-3 lg:h-95 lg:grid-cols-[1.9fr_1fr]'>
        {/* main rotating panel */}
        <div className='relative h-60 overflow-hidden rounded-3xl sm:h-72 lg:h-full'>
          <AnimatePresence mode='popLayout'>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className={`absolute inset-0 bg-linear-to-br ${slide.theme}`}
            >
              {/* full-bleed image with a dark brand overlay so the panel is never a flat block */}
              <Img src={slide.image} alt='' className='absolute inset-0 h-full w-full object-cover' />
              <div aria-hidden className='absolute inset-0 bg-linear-to-r from-royal-950/90 via-royal-950/55 to-royal-950/10' />

              <div className='relative z-10 flex h-full max-w-[68%] flex-col justify-center px-6 sm:max-w-[58%] sm:px-9'>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
                  className='text-[10px] font-bold uppercase tracking-[0.22em] text-white/70 sm:text-[11px]'
                >
                  {slide.kicker}
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.55, ease: EASE }}
                  className='mt-2 whitespace-pre-line font-display text-[19px] font-bold leading-tight text-white text-shadow-hero min-[400px]:text-[22px] sm:text-[30px] lg:text-[34px]'
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
                  className='mt-1.5 hidden text-[13px] text-white/70 sm:block'
                >
                  {slide.sub}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
                  className='mt-4'
                >
                  <Link
                    to={slide.to}
                    className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11.5px] font-bold text-slate-900 transition-transform hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-[12.5px]'
                  >
                    {slide.cta}
                    <ArrowRight className='h-3.5 w-3.5' strokeWidth={2.4} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* dots */}
          <div className='absolute bottom-4 left-6 z-20 flex items-center gap-1.5 sm:left-9'>
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* stacked promo cards */}
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-1 lg:grid-rows-2'>
          {SIDE_TILES.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.55, ease: EASE }}
              className='h-full'
            >
              <Link
                to={t.to}
                className='group relative block h-32 overflow-hidden rounded-3xl min-[400px]:h-36 sm:h-40 lg:h-full'
              >
                <Img
                  src={t.image}
                  alt={t.title}
                  className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-107'
                />
                <div className='absolute inset-0 bg-linear-to-t from-royal-950/85 via-royal-950/25 to-transparent' />
                {t.badge && (
                  <span className='absolute left-3.5 top-3.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-900'>
                    {t.badge}
                  </span>
                )}
                <div className='absolute inset-x-0 bottom-0 flex items-end justify-between p-4'>
                  <div>
                    <h3 className='font-display text-[16px] font-bold text-white sm:text-[18px]'>{t.title}</h3>
                    <p className='text-[11px] text-white/70 sm:text-[12px]'>{t.sub}</p>
                  </div>
                  <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-slate-900 transition-transform duration-300 group-hover:rotate-45'>
                    <ArrowUpRight className='h-4 w-4' strokeWidth={2.2} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Container>
  )
}

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import useAssistant from '../../hooks/useAssistant'
import AssistantPanel from './AssistantPanel'

/* Routes with their own fixed bottom-right element (Dash basket) or a
   deliberately distraction-free flow — the launcher stays out of those. */
const HIDDEN_ON = ['/quick', '/checkout', '/order-success']

/* Routes with a fixed mobile action bar the launcher must clear. */
const MOBILE_ACTION_BAR = ['/cart', '/product/']

export default function ShopAssistant () {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const assistant = useAssistant()

  const hidden = HIDDEN_ON.some(route => pathname.startsWith(route))

  // navigating from inside the panel closes it via onNavigate, so only
  // the keyboard shortcut needs wiring here
  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (hidden) return null

  const clearsActionBar = MOBILE_ACTION_BAR.some(route =>
    pathname.startsWith(route)
  )
  const launcherBottom = clearsActionBar
    ? 'bottom-33 md:bottom-6'
    : 'bottom-18 md:bottom-6'

  return createPortal(
    <>
      {/* launcher */}
      <motion.button
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(v => !v)}
        aria-label={
          open ? 'Close shopping assistant' : 'Open shopping assistant'
        }
        className={`fixed right-4 z-60 flex items-center gap-2 rounded-full bg-linear-to-br from-royal-600 to-royal-800 p-4 text-white shadow-glow-royal transition-shadow hover:shadow-card-hover md:right-6 ${launcherBottom}`}
      >
        <span className='relative grid place-items-center'>
          {!open && (
            <span className='absolute inset-0 -m-1 rounded-full bg-olive-400/40 animate-pulse-ring' />
          )}
          <AnimatePresence mode='popLayout' initial={false}>
            <motion.span
              key={open ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className='grid place-items-center'
            >
              {open ? (
                <X className='h-5 w-5' strokeWidth={2.4} />
              ) : (
                <Sparkles className='h-5 w-5' strokeWidth={2.2} />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        {/* <span className='hidden text-[12.5px] font-bold md:inline'>
          {open ? 'Close' : 'Need help?'}
        </span> */}
      </motion.button>

      {/* mobile backdrop — the desktop panel behaves as a corner widget */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className='fixed inset-0 z-70 bg-royal-950/50 backdrop-blur-sm sm:hidden'
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <AssistantPanel
            assistant={assistant}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}

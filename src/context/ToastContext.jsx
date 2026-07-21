import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Heart, Ticket, Trash2 } from 'lucide-react'

/** Lightweight toast system — bottom-center, auto-dismiss, springy. */

const ToastContext = createContext(null)

const ICONS = {
  cart: CheckCircle2,
  wishlist: Heart,
  coupon: Ticket,
  remove: Trash2
}

export function ToastProvider ({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const toast = useCallback((message, kind = 'cart') => {
    const id = ++idRef.current
    setToasts(prev => [...prev.slice(-2), { id, message, kind }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2600)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className='pointer-events-none fixed inset-x-0 bottom-20 z-90 flex flex-col items-center gap-2 px-4 sm:bottom-8'>
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = ICONS[t.kind] || CheckCircle2
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className='pointer-events-auto flex items-center gap-2.5 rounded-full bg-royal-950/95 py-2.5 pl-3.5 pr-5 text-[13px] font-medium text-white shadow-2xl backdrop-blur'
              >
                <span className='flex h-6 w-6 items-center justify-center rounded-full bg-olive-500/25 text-olive-300'>
                  <Icon className='h-3.5 w-3.5' strokeWidth={2.2} />
                </span>
                {t.message}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

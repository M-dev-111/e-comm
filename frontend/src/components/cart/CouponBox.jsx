import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, X, ChevronDown } from 'lucide-react'
import { COUPONS } from '../../data/data'
import { useCart } from '../../context/CartContext'
import { formatINR } from '../../utils/format'
import { toast } from 'sonner'

export default function CouponBox () {
  const cart = useCart()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)

  const apply = raw => {
    const c = COUPONS.find(x => x.code === raw.trim().toUpperCase())
    if (!c) return setError('Invalid coupon code')
    if (cart.priceTotal < c.minOrder) return setError(`Needs a minimum order of ${formatINR(c.minOrder)}`)
    setError('')
    setCode('')
    cart.applyCoupon(c.code)
    toast.success(`Coupon ${c.code} applied`, { icon: <Ticket className='h-4 w-4' /> })
  }

  return (
    <div className='rounded-2xl border border-slate-100 bg-white p-5 shadow-card'>
      <div className='flex items-center gap-2'>
        <Ticket className='h-4.5 w-4.5 text-royal-600' strokeWidth={2.2} />
        <span className='text-[13.5px] font-bold text-slate-900'>Apply coupon</span>
      </div>

      {cart.coupon ? (
        <div className='mt-3 flex items-center justify-between rounded-xl border border-olive-300 bg-olive-50 px-4 py-3'>
          <div>
            <p className='text-[13px] font-extrabold text-olive-700'>{cart.coupon.code}</p>
            <p className='text-[11.5px] text-olive-600'>− {formatINR(cart.couponDiscount)} applied</p>
          </div>
          <button
            onClick={() => cart.removeCoupon()}
            aria-label='Remove coupon'
            className='grid h-7 w-7 place-items-center rounded-full text-olive-700 transition-colors hover:bg-olive-100'
          >
            <X className='h-4 w-4' strokeWidth={2.4} />
          </button>
        </div>
      ) : (
        <>
          <div className='mt-3 flex gap-2'>
            <input
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase())
                setError('')
              }}
              onKeyDown={e => e.key === 'Enter' && apply(code)}
              placeholder='Enter code'
              className='min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] font-semibold tracking-wide outline-none transition-colors focus:border-royal-400'
            />
            <button
              onClick={() => apply(code)}
              className='rounded-xl bg-royal-600 px-4 text-[12.5px] font-bold text-white transition-colors hover:bg-royal-700'
            >
              Apply
            </button>
          </div>
          {error && <p className='mt-2 text-[12px] font-semibold text-rose-500'>{error}</p>}
        </>
      )}

      <button
        onClick={() => setShowAll(v => !v)}
        className='mt-3 flex items-center gap-1 text-[12px] font-bold text-royal-600'
      >
        View available coupons
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {showAll && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='overflow-hidden'
          >
            <div className='mt-3 space-y-2'>
              {COUPONS.map(c => {
                const eligible = cart.priceTotal >= c.minOrder
                return (
                  <button
                    key={c.code}
                    disabled={!eligible}
                    onClick={() => apply(c.code)}
                    className={`w-full rounded-xl border border-dashed px-3.5 py-2.5 text-left transition-colors ${
                      eligible ? 'border-royal-300 hover:bg-royal-50' : 'cursor-not-allowed border-slate-200 opacity-50'
                    }`}
                  >
                    <p className='text-[12.5px] font-extrabold tracking-wide text-royal-700'>{c.code}</p>
                    <p className='text-[11.5px] text-slate-500'>{c.label}</p>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

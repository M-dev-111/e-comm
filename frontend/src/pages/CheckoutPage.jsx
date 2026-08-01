import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Banknote, CalendarClock, Check, ClipboardList, CreditCard,
  Landmark, Loader2, Lock, MapPin, Plus, Smartphone
} from 'lucide-react'
import { PAYMENT_METHODS } from '../data/data'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useAddresses } from '../context/AddressContext'
import { useOrders } from '../context/OrdersContext'
import AddressForm from '../components/checkout/AddressForm'
import { formatINR, orderIdFrom, deliveryDateLabel } from '../utils/format'
import { EASE } from '../utils/motion'
import PriceSummary from '../components/cart/PriceSummary'
import EmptyState from '../components/ui/EmptyState'
import Container from '../components/ui/Container'
import Img from '../components/ui/Img'
import AuthModal from '../components/auth/AuthModal'

const STEPS = ['Address', 'Payment', 'Review']

function Stepper ({ step }) {
  return (
    <div className='flex items-center'>
      {STEPS.map((label, i) => {
        const done = i < step
        const active = i === step
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <div className='relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200 sm:mx-3'>
                <motion.div
                  initial={false}
                  animate={{ width: done || active ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className='h-full bg-royal-600'
                />
              </div>
            )}
            <div className='flex items-center gap-2'>
              <motion.span
                animate={active ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
                className={`grid h-8 w-8 place-items-center rounded-full text-[12.5px] font-bold transition-colors ${
                  done
                    ? 'bg-olive-600 text-white'
                    : active
                      ? 'bg-royal-600 text-white shadow-glow-royal'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? <Check className='h-4 w-4' strokeWidth={3} /> : i + 1}
              </motion.span>
              <span className={`hidden text-[12.5px] font-bold sm:block ${active || done ? 'text-slate-900' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

function AddressStep ({ selected, onSelect }) {
  const { addresses } = useAddresses()
  const [adding, setAdding] = useState(false)
  return (
    <div className='space-y-3'>
      {addresses.map(a => (
        <button
          key={a.id}
          onClick={() => onSelect(a)}
          className={`w-full rounded-2xl border-2 bg-white p-4 text-left transition-all ${
            selected?.id === a.id ? 'border-royal-600 shadow-glow-royal' : 'border-slate-100 shadow-card hover:border-royal-200'
          }`}
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <span className='rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-slate-500'>{a.type}</span>
              <span className='text-[14px] font-bold text-slate-900'>{a.name}</span>
              {a.default && <span className='text-[10.5px] font-bold text-olive-600'>DEFAULT</span>}
            </div>
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border-2 transition-colors ${
                selected?.id === a.id ? 'border-royal-600 bg-royal-600' : 'border-slate-300'
              }`}
            >
              {selected?.id === a.id && <span className='h-1.5 w-1.5 rounded-full bg-white' />}
            </span>
          </div>
          <p className='mt-2 text-[13px] leading-relaxed text-slate-600'>
            {a.line1}, {a.line2}, {a.city}, {a.state} — <span className='font-bold'>{a.pincode}</span>
          </p>
          <p className='mt-1 text-[12.5px] text-slate-400'>{a.phone}</p>
        </button>
      ))}

      <button
        onClick={() => setAdding(v => !v)}
        className='flex w-full items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-4 text-[13px] font-bold text-royal-600 transition-colors hover:border-royal-300 hover:bg-royal-50/50'
      >
        <Plus className='h-4 w-4' strokeWidth={2.5} /> Add a new address
      </button>

      <AnimatePresence>
        {adding && (
          <AddressForm
            onSaved={address => {
              onSelect(address)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const PAY_ICONS = {
  upi: Smartphone,
  card: CreditCard,
  netbanking: Landmark,
  emi: CalendarClock,
  cod: Banknote
}

function PaymentStep ({ selected, onSelect }) {
  return (
    <div className='space-y-3'>
      {PAYMENT_METHODS.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m)}
          className={`flex w-full items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition-all ${
            selected?.id === m.id ? 'border-royal-600 shadow-glow-royal' : 'border-slate-100 shadow-card hover:border-royal-200'
          }`}
        >
          <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-royal-50'>
            {(() => {
              const Icon = PAY_ICONS[m.id] || CreditCard
              return <Icon className='h-5 w-5 text-royal-600' strokeWidth={1.9} />
            })()}
          </span>
          <div className='min-w-0 flex-1'>
            <p className='text-[14px] font-bold text-slate-900'>{m.label}</p>
            <p className='text-[12px] text-slate-400'>{m.sub}</p>
            {m.offer && <p className='mt-1 text-[11.5px] font-bold text-olive-600'>{m.offer}</p>}
          </div>
          <span
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
              selected?.id === m.id ? 'border-royal-600 bg-royal-600' : 'border-slate-300'
            }`}
          >
            {selected?.id === m.id && <span className='h-1.5 w-1.5 rounded-full bg-white' />}
          </span>
        </button>
      ))}
    </div>
  )
}

function ReviewStep ({ address, payment }) {
  const cart = useCart()
  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border border-slate-100 bg-white p-4 shadow-card'>
        <p className='flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-slate-400'>
          <MapPin className='h-3.5 w-3.5 text-royal-600' /> Delivering to
        </p>
        <p className='mt-1.5 text-[13.5px] font-semibold text-slate-800'>
          {address.name} · {address.type}
        </p>
        <p className='text-[12.5px] text-slate-500'>
          {address.line1}, {address.city} — {address.pincode}
        </p>
        <p className='mt-2 border-t border-dashed border-slate-200 pt-2 text-[12.5px] text-slate-500'>
          Paying via <span className='font-bold text-slate-800'>{payment.label}</span>
        </p>
      </div>

      <div className='space-y-2.5'>
        {cart.lines.map(line => {
          const p = line.product
          const isQuick = p.id.startsWith('q')
          return (
            <div key={line.key} className='flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card'>
              <Img src={isQuick ? p.image : p.images[0]} alt='' className='h-14 w-14 rounded-lg object-cover' />
              <div className='min-w-0 flex-1'>
                <p className='clamp-1 text-[13px] font-semibold text-slate-800'>{p.name}</p>
                <p className='text-[11.5px] text-slate-400'>
                  Qty {line.qty}
                  {line.size ? ` · ${line.size}` : ''} · {isQuick ? `arrives in ${p.eta} min` : `delivery by ${deliveryDateLabel(p.deliveryDays)}`}
                </p>
              </div>
              <span className='text-[13.5px] font-bold text-slate-900'>{formatINR(p.price * line.qty)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CheckoutPage () {
  const cart = useCart()
  const auth = useAuth()
  const navigate = useNavigate()
  const { addresses } = useAddresses()
  const { placeOrder: placeOrderRecord } = useOrders()
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState(() => addresses.find(a => a.default) || addresses[0])
  const [payment, setPayment] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  // orders require a logged-in user — gate the whole checkout behind login
  if (!auth.user) {
    return (
      <Container className='py-20'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className='mx-auto max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-card'
        >
          <span className='mx-auto grid h-16 w-16 place-items-center rounded-full bg-royal-50'>
            <Lock className='h-7 w-7 text-royal-500' strokeWidth={1.8} />
          </span>
          <h1 className='mt-5 font-display text-xl font-bold text-slate-900'>Login to place your order</h1>
          <p className='mt-2 text-[13px] leading-relaxed text-slate-500'>
            You need to be logged in before checking out. Any valid email and 6-digit OTP
            works in this demo.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className='mt-6 w-full rounded-xl bg-royal-600 py-3.5 text-[13.5px] font-bold text-white shadow-glow-royal transition-colors hover:bg-royal-700'
          >
            Login to continue
          </button>
          <button
            onClick={() => navigate('/cart')}
            className='mt-3 w-full rounded-xl py-2.5 text-[12.5px] font-bold text-slate-500 transition-colors hover:bg-slate-50'
          >
            Back to cart
          </button>
        </motion.div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </Container>
    )
  }

  if (cart.isLoading) {
    return <div className='min-h-[60vh]' />
  }

  if (cart.lines.length === 0 && !placing) {
    return <EmptyState icon={ClipboardList} title='Nothing to check out' sub='Your cart is empty. Add items to proceed to checkout.' cta='Browse products' to='/' />
  }

  const canNext = step === 0 ? !!address : step === 1 ? !!payment : true

  const placeOrder = () => {
    if (!auth.user) return
    setPlacing(true)

    const order = {
      id: orderIdFrom(Date.now()),
      placedAt: new Date().toISOString(),
      status: 'confirmed',
      total: cart.total,
      savings: cart.savings,
      count: cart.count,
      payment: payment.label,
      address,
      etaDays: 3,
      eta: deliveryDateLabel(3),
      // snapshot each line so order history is independent of the catalogue
      items: cart.lines.map(line => ({
        id: line.id,
        qty: line.qty,
        size: line.size,
        color: line.color,
        name: line.product.name,
        brand: line.product.brand,
        image: line.product.images?.[0] || line.product.image || '',
        price: line.product.price
      }))
    }

    // simulate a payment round-trip, then hand off to the success page
    setTimeout(() => {
      placeOrderRecord(order)
      sessionStorage.setItem('mcom.lastOrder', JSON.stringify(order))
      cart.clear()
      navigate('/order-success', { replace: true })
    }, 1600)
  }

  return (
    <Container className='py-6'>
      <div className='mx-auto w-full max-w-6xl'>
        <div className='flex items-center justify-between gap-6'>
          <h1 className='flex items-center gap-2 font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>
            <Lock className='h-5 w-5 text-olive-600' /> Secure Checkout
          </h1>
          <div className='w-full max-w-xs sm:max-w-sm'>
            <Stepper step={step} />
          </div>
        </div>

        <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]'>
          <div>
            <AnimatePresence mode='wait'>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {step === 0 && <AddressStep selected={address} onSelect={setAddress} />}
                {step === 1 && <PaymentStep selected={payment} onSelect={setPayment} />}
                {step === 2 && <ReviewStep address={address} payment={payment} />}
              </motion.div>
            </AnimatePresence>

            {/* nav buttons */}
            <div className='mt-6 flex items-center justify-between'>
              <button
                onClick={() => (step === 0 ? navigate('/cart') : setStep(s => s - 1))}
                className='flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-500 transition-colors hover:bg-slate-100'
              >
                <ArrowLeft className='h-4 w-4' /> Back
              </button>

              {step < 2 ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={!canNext}
                  onClick={() => setStep(s => s + 1)}
                  className='flex items-center gap-2 rounded-xl bg-royal-600 px-7 py-3 text-[13.5px] font-bold text-white shadow-glow-royal transition-all hover:bg-royal-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none'
                >
                  Continue <ArrowRight className='h-4 w-4' strokeWidth={2.4} />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={placing}
                  onClick={placeOrder}
                  className='flex items-center gap-2 rounded-xl bg-linear-to-r from-olive-600 to-olive-500 px-7 py-3 text-[13.5px] font-bold text-white shadow-glow-olive transition-transform hover:-translate-y-0.5 disabled:opacity-70'
                >
                  {placing ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' /> Placing order…
                    </>
                  ) : (
                    <>Place Order · {formatINR(cart.total)}</>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          <div className='lg:sticky lg:top-44 lg:self-start'>
            <PriceSummary compact />
          </div>
        </div>
      </div>
    </Container>
  )
}

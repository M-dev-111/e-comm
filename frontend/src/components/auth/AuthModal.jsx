import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lock, ShieldCheck, Smartphone, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { EASE } from '../../utils/motion'

/**
 * Two-panel auth modal.
 * Static flow: phone (+ name on sign-up) → any 6-digit OTP → logged in.
 */
export default function AuthModal ({ open, onClose }) {
  const auth = useAuth()
  const toast = useToast()

  const [mode, setMode] = useState('login') // login | signup
  const [step, setStep] = useState('form') // form | otp
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const reset = () => {
    setStep('form')
    setOtp('')
    setError('')
  }

  const close = () => {
    reset()
    onClose()
  }

  const requestOtp = e => {
    e.preventDefault()
    if (mode === 'signup' && name.trim().length < 2) return setError('Please enter your full name')
    if (!/^\d{10}$/.test(phone)) return setError('Please enter a valid 10-digit mobile number')
    setError('')
    setStep('otp')
  }

  const verifyOtp = e => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp)) return setError('Please enter the 6-digit OTP')
    const displayName = mode === 'signup' ? name.trim() : `User ${phone.slice(-4)}`
    auth.login(displayName, phone)
    toast(`Welcome, ${displayName.split(' ')[0]}`)
    close()
  }

  // portal to <body> so sticky/filtered ancestors can't offset the fixed overlay
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className='fixed inset-0 z-90 bg-royal-950/60 backdrop-blur-sm'
          />
          <div className='pointer-events-none fixed inset-0 z-95 grid place-items-center p-4'>
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EASE }}
              className='pointer-events-auto grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl sm:grid-cols-[280px_1fr]'
            >
              {/* left brand panel */}
              <div className='hidden flex-col justify-between bg-linear-to-b from-royal-700 to-royal-900 p-7 text-white sm:flex'>
                <div>
                  <h2 className='font-display text-[22px] font-bold leading-snug'>
                    {mode === 'login' ? 'Welcome back' : 'Join mCOM'}
                  </h2>
                  <p className='mt-3 text-[13px] leading-relaxed text-white/65'>
                    {mode === 'login'
                      ? 'Get access to your orders, wishlist and personalised recommendations.'
                      : 'Sign up to start your shopping journey with mCOM.'}
                  </p>
                </div>
                <div className='space-y-2.5 text-[12px] text-white/55'>
                  <p className='flex items-center gap-2'>
                    <ShieldCheck className='h-4 w-4 text-olive-300' /> Your data stays on this device
                  </p>
                  <p className='flex items-center gap-2'>
                    <Lock className='h-4 w-4 text-olive-300' /> Demonstration only — no OTP is sent
                  </p>
                </div>
              </div>

              {/* right form panel */}
              <div className='relative p-6 sm:p-8'>
                <button
                  aria-label='Close'
                  onClick={close}
                  className='absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'
                >
                  <X className='h-4.5 w-4.5' strokeWidth={2.2} />
                </button>

                <AnimatePresence mode='wait'>
                  {step === 'form' ? (
                    <motion.form
                      key='form'
                      onSubmit={requestOtp}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3 className='font-display text-lg font-bold text-slate-900 sm:hidden'>
                        {mode === 'login' ? 'Login' : 'Create account'}
                      </h3>

                      <div className='mt-4 space-y-3.5 sm:mt-2'>
                        {mode === 'signup' && (
                          <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder='Full name'
                            className='w-full rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] outline-none transition-colors focus:border-royal-400'
                          />
                        )}
                        <div className='flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 transition-colors focus-within:border-royal-400'>
                          <span className='text-[13.5px] font-semibold text-slate-500'>+91</span>
                          <input
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder='Mobile number'
                            inputMode='numeric'
                            className='w-full text-[13.5px] outline-none'
                          />
                        </div>
                      </div>

                      {error && <p className='mt-2.5 text-[12px] font-semibold text-rose-500'>{error}</p>}

                      <p className='mt-4 text-[11px] leading-relaxed text-slate-400'>
                        By continuing, you agree to mCOM's Terms of Use and Privacy Policy.
                      </p>

                      <button
                        type='submit'
                        className='mt-4 w-full rounded-xl bg-royal-600 py-3.5 text-[13.5px] font-bold text-white shadow-glow-royal transition-colors hover:bg-royal-700'
                      >
                        Request OTP
                      </button>

                      <button
                        type='button'
                        onClick={() => {
                          setMode(m => (m === 'login' ? 'signup' : 'login'))
                          setError('')
                        }}
                        className='mt-5 w-full text-center text-[12.5px] font-bold text-royal-600 transition-colors hover:text-royal-800'
                      >
                        {mode === 'login' ? 'New to mCOM? Create an account' : 'Existing user? Log in'}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key='otp'
                      onSubmit={verifyOtp}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                    >
                      <button
                        type='button'
                        onClick={reset}
                        className='flex items-center gap-1.5 text-[12.5px] font-bold text-slate-500 transition-colors hover:text-slate-800'
                      >
                        <ArrowLeft className='h-4 w-4' /> Back
                      </button>

                      <div className='mt-5 flex items-center gap-3'>
                        <span className='grid h-11 w-11 place-items-center rounded-xl bg-royal-50'>
                          <Smartphone className='h-5 w-5 text-royal-600' strokeWidth={1.9} />
                        </span>
                        <div>
                          <p className='text-[14px] font-bold text-slate-900'>Verify your number</p>
                          <p className='text-[12px] text-slate-400'>OTP sent to +91 {phone} (enter any 6 digits)</p>
                        </div>
                      </div>

                      <input
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder='6-digit OTP'
                        inputMode='numeric'
                        autoFocus
                        className='mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-[16px] font-bold tracking-[0.4em] outline-none transition-colors focus:border-royal-400'
                      />

                      {error && <p className='mt-2.5 text-[12px] font-semibold text-rose-500'>{error}</p>}

                      <button
                        type='submit'
                        className='mt-4 w-full rounded-xl bg-olive-600 py-3.5 text-[13.5px] font-bold text-white shadow-glow-olive transition-colors hover:bg-olive-700'
                      >
                        Verify & Continue
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

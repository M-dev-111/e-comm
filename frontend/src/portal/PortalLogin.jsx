import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck, Store } from 'lucide-react'
import { toast } from 'sonner'
import { usePortalAuth } from './PortalAuthContext'
import { Button, Field } from './ui'
import { EASE } from '../utils/motion'

const loginSchema = z.object({
  email: z.email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
  companySlug: z.string().trim().optional()
})

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.'),
  email: z.email('Enter a valid email.'),
  password: z.string().min(6, 'At least 6 characters.'),
  companySlug: z.string().trim().min(2, 'Enter the store address (e.g. aurora).')
})

export default function PortalLogin () {
  const [mode, setMode] = useState('login') // login | register
  const { login, register: registerCustomer } = usePortalAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/portal'

  const isLogin = mode === 'login'
  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    mode: 'onSubmit'
  })
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = form

  const submit = async values => {
    try {
      if (isLogin) {
        const clean = { ...values }
        if (!clean.companySlug) delete clean.companySlug
        const user = await login(clean)
        toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
      } else {
        const user = await registerCustomer(values)
        toast.success(`Account created — welcome, ${user.name.split(' ')[0]}`)
      }
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    }
  }

  const swap = next => { setMode(next); reset() }

  return (
    <div className='grid min-h-dvh lg:grid-cols-2'>
      {/* brand panel */}
      <div className='relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-royal-700 via-royal-800 to-royal-950 p-10 text-white lg:flex'>
        <div aria-hidden className='pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-olive-500/20 blur-3xl' />
        <div aria-hidden className='pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-royal-400/20 blur-3xl' />
        <Link to='/' className='relative inline-flex items-center gap-2 font-display text-xl font-extrabold'>
          <span className='grid h-9 w-9 place-items-center rounded-xl bg-olive-500'><Sparkles className='h-5 w-5' /></span>
          mCOM
        </Link>
        <div className='relative'>
          <h1 className='font-display text-4xl font-extrabold leading-tight'>One platform.<br />Every store.</h1>
          <p className='mt-4 max-w-md text-[15px] leading-relaxed text-white/70'>
            The multi-tenant commerce suite. Super admins run the platform, companies run their stores,
            vendors list products, and customers shop — each in their own secure space.
          </p>
          <div className='mt-8 space-y-3 text-[13px] text-white/60'>
            <p className='flex items-center gap-2.5'><ShieldCheck className='h-4.5 w-4.5 text-olive-300' /> Role-based access for every account</p>
            <p className='flex items-center gap-2.5'><Store className='h-4.5 w-4.5 text-olive-300' /> Fully isolated per-company data</p>
          </div>
        </div>
        <p className='relative text-[12px] text-white/40'>© mCOM. Royal blue × olive green.</p>
      </div>

      {/* form panel */}
      <div className='flex items-center justify-center bg-slate-50 p-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
          className='w-full max-w-sm'
        >
          <div className='mb-6 lg:hidden'>
            <Link to='/' className='inline-flex items-center gap-2 font-display text-lg font-extrabold text-royal-800'>
              <span className='grid h-8 w-8 place-items-center rounded-lg bg-olive-500 text-white'><Sparkles className='h-4 w-4' /></span>
              mCOM
            </Link>
          </div>

          <h2 className='font-display text-2xl font-extrabold text-royal-950'>
            {isLogin ? 'Sign in to your portal' : 'Create a shopper account'}
          </h2>
          <p className='mt-1 text-[13px] text-slate-500'>
            {isLogin ? 'Super admins, admins, vendors and customers.' : 'Register as a customer of a specific store.'}
          </p>

          <form onSubmit={handleSubmit(submit)} noValidate className='mt-6 space-y-3.5'>
            {!isLogin && (
              <Field label='Full name' placeholder='Jane Doe' error={errors.name?.message} {...register('name')} />
            )}
            <Field label='Email' type='email' placeholder='you@company.com' error={errors.email?.message} {...register('email')} />
            <Field label='Password' type='password' placeholder='••••••••' error={errors.password?.message} {...register('password')} />
            <Field
              label={isLogin ? 'Store address (optional)' : 'Store address'}
              placeholder='e.g. aurora'
              hint={isLogin ? 'Only needed if your email exists on more than one store.' : 'The store you are signing up to shop at.'}
              error={errors.companySlug?.message}
              {...register('companySlug')}
            />
            <Button type='submit' size='lg' loading={isSubmitting} className='w-full'>
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className='mt-5 text-center text-[13px] text-slate-500'>
            {isLogin ? (
              <>New customer? <button onClick={() => swap('register')} className='font-bold text-royal-600 hover:text-royal-800'>Create an account</button></>
            ) : (
              <>Already have an account? <button onClick={() => swap('login')} className='font-bold text-royal-600 hover:text-royal-800'>Sign in</button></>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

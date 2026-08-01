import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { usePortalAuth } from '../PortalAuthContext'
import { registerSchema } from '../schemas'

const inputClass =
  'mt-2 w-full rounded-xl border border-royal-200 bg-royal-50/40 px-3.5 py-2.5 text-sm text-royal-950 outline-none transition focus:border-royal-400 focus:bg-white focus:ring-4 focus:ring-royal-500/10 aria-invalid:border-rose-400'

export default function AccountRegister () {
  const { register: registerAccount } = usePortalAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onTouched'
  })

  const submit = async values => {
    try {
      await registerAccount({ ...values, tenantSlug: import.meta.env.VITE_TENANT_SLUG || 'demo' })
      navigate('/account', { replace: true })
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='flex min-h-dvh items-center justify-center bg-royal-50/40 px-4'>
      <form onSubmit={handleSubmit(submit)} noValidate className='w-full max-w-sm rounded-2xl border border-royal-100 bg-white p-6 shadow-card sm:p-8'>
        <h1 className='font-display text-2xl font-extrabold tracking-tight text-royal-950'>Create your account</h1>
        <p className='mt-1.5 text-sm text-royal-900/60'>So you can apply to become a vendor.</p>

        <label className='mt-6 block text-xs font-bold uppercase tracking-wider text-royal-900/50'>Name</label>
        <input aria-invalid={!!errors.name} {...register('name')} className={inputClass} />
        {errors.name && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.name.message}</p>}

        <label className='mt-4 block text-xs font-bold uppercase tracking-wider text-royal-900/50'>Email</label>
        <input type='email' aria-invalid={!!errors.email} {...register('email')} className={inputClass} />
        {errors.email && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.email.message}</p>}

        <label className='mt-4 block text-xs font-bold uppercase tracking-wider text-royal-900/50'>Password</label>
        <input type='password' aria-invalid={!!errors.password} {...register('password')} className={inputClass} />
        {errors.password && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.password.message}</p>}

        <button
          type='submit'
          disabled={isSubmitting}
          className='mt-6 w-full rounded-xl bg-royal-600 px-4 py-2.5 text-sm font-bold text-white shadow-glow-royal transition hover:bg-royal-700 disabled:opacity-50'
        >
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

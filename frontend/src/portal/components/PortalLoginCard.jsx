import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { usePortalAuth } from '../PortalAuthContext'
import { homeFor } from '../roles'
import { loginSchema } from '../schemas'

const inputClass =
  'mt-2 w-full rounded-xl border border-royal-200 bg-royal-50/40 px-3.5 py-2.5 text-sm text-royal-950 outline-none transition focus:border-royal-400 focus:bg-white focus:ring-4 focus:ring-royal-500/10 aria-invalid:border-rose-400'

/** Shared login form for the super-admin / admin / vendor / account portals. */
export default function PortalLoginCard ({ title, subtitle, expectedRole, redirectTo, registerPath }) {
  const { login } = usePortalAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit'
  })

  const onSubmit = async ({ email, password }) => {
    try {
      const user = await login(email, password)
      /* Valid credentials for a different portal — send them where they belong
         rather than rejecting a login that actually succeeded. */
      if (user.role !== expectedRole) {
        toast.info(`Signed in as ${user.role.replace('_', ' ')} — taking you to your portal.`)
        navigate(homeFor(user.role), { replace: true })
        return
      }
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='flex min-h-dvh items-center justify-center bg-royal-50/40 px-4'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className='w-full max-w-sm rounded-2xl border border-royal-100 bg-white p-6 shadow-card sm:p-8'
      >
        <h1 className='font-display text-2xl font-extrabold tracking-tight text-royal-950'>{title}</h1>
        {subtitle && <p className='mt-1.5 text-sm text-royal-900/60'>{subtitle}</p>}

        <label className='mt-6 block text-xs font-bold uppercase tracking-wider text-royal-900/50'>Email</label>
        <input
          type='email'
          autoComplete='email'
          aria-invalid={!!errors.email}
          {...register('email')}
          className={inputClass}
        />
        {errors.email && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.email.message}</p>}

        <label className='mt-4 block text-xs font-bold uppercase tracking-wider text-royal-900/50'>Password</label>
        <input
          type='password'
          autoComplete='current-password'
          aria-invalid={!!errors.password}
          {...register('password')}
          className={inputClass}
        />
        {errors.password && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.password.message}</p>}

        <button
          type='submit'
          disabled={isSubmitting}
          className='mt-6 w-full rounded-xl bg-royal-600 px-4 py-2.5 text-sm font-bold text-white shadow-glow-royal transition hover:bg-royal-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>

        {registerPath && (
          <p className='mt-4 text-center text-sm text-royal-900/60'>
            No account?{' '}
            <Link to={registerPath} className='font-semibold text-royal-700 hover:underline'>
              Create one
            </Link>
          </p>
        )}
      </form>
    </div>
  )
}

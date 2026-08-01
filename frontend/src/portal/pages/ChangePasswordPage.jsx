import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { portalApi } from '../api'
import { usePortalAuth } from '../PortalAuthContext'
import { homeFor } from '../roles'
import { changePasswordSchema } from '../schemas'
import PortalLayout from '../components/PortalLayout'

const inputClass =
  'mt-2 w-full rounded-xl border border-royal-200 bg-royal-50/40 px-3.5 py-2.5 text-sm text-royal-950 outline-none transition focus:border-royal-400 focus:bg-white focus:ring-4 focus:ring-royal-500/10'

export default function ChangePasswordPage () {
  const { user } = usePortalAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
    mode: 'onTouched'
  })

  if (!user) return <Navigate to='/' replace />

  const submit = async values => {
    try {
      await portalApi.post('/api/auth/change-password', values)
      toast.success('Password changed. Please sign in again next time with the new one.')
      reset({ currentPassword: '', newPassword: '' })
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <PortalLayout title='Change password' tabs={[{ label: '← Back to dashboard', to: homeFor(user.role), end: true }]}>
      <div className='max-w-md rounded-2xl border border-royal-100 bg-white p-6 shadow-card'>
        <form onSubmit={handleSubmit(submit)} noValidate className='grid gap-4'>
          <label className='block'>
            <span className='text-xs font-bold uppercase tracking-wider text-royal-900/50'>Current password</span>
            <input type='password' {...register('currentPassword')} className={inputClass} />
            {errors.currentPassword && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.currentPassword.message}</p>}
          </label>
          <label className='block'>
            <span className='text-xs font-bold uppercase tracking-wider text-royal-900/50'>New password</span>
            <input type='password' {...register('newPassword')} className={inputClass} />
            {errors.newPassword && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.newPassword.message}</p>}
          </label>
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-fit rounded-xl bg-royal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-royal-700 disabled:opacity-50'
          >
            {isSubmitting ? 'Saving…' : 'Change password'}
          </button>
        </form>
      </div>
    </PortalLayout>
  )
}

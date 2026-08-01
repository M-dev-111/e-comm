import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { portalApi } from '../api'
import { usePortalAuth } from '../PortalAuthContext'
import PortalLayout from '../components/PortalLayout'
import { vendorApplicationSchema } from '../schemas'

const inputClass =
  'mt-2 w-full rounded-xl border border-royal-200 bg-royal-50/40 px-3.5 py-2.5 text-sm text-royal-950 outline-none transition focus:border-royal-400 focus:bg-white focus:ring-4 focus:ring-royal-500/10'

const STATUS_COPY = {
  pending: 'Your application is pending review by the store admin.',
  approved: 'Approved! Log in at the vendor portal with the same email/password.',
  rejected: 'Your last application was rejected. You can apply again below.'
}

export default function AccountDashboard () {
  const { user } = usePortalAuth()
  const queryClient = useQueryClient()

  const applicationQuery = useQuery({
    queryKey: ['account', 'vendor-application'],
    queryFn: () => portalApi.get('/api/customer/vendor-application').then(r => r.data.vendorApplication)
  })
  const application = applicationQuery.data
  const loading = applicationQuery.isLoading

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(vendorApplicationSchema),
    defaultValues: { businessName: '', note: '' },
    mode: 'onTouched'
  })

  const submit = async values => {
    try {
      await portalApi.post('/api/customer/vendor-application', values)
      toast.success('Application submitted.')
      reset({ businessName: '', note: '' })
      queryClient.invalidateQueries({ queryKey: ['account', 'vendor-application'] })
    } catch (error) {
      toast.error(error.message)
    }
  }

  const canApply = !loading && (!application || application.status === 'none' || application.status === 'rejected')

  return (
    <PortalLayout title='My account'>
      <div className='grid gap-5'>
        <div className='rounded-2xl border border-royal-100 bg-white p-6 shadow-card'>
          <p className='text-sm text-royal-900/50'>Signed in as</p>
          <h2 className='mt-1 font-display text-xl font-extrabold text-royal-950'>{user?.name}</h2>
          <p className='mt-1 text-sm text-royal-900/60'>{user?.email}</p>
        </div>

        {!loading && application && application.status !== 'none' && (
          <div className='rounded-2xl border border-royal-100 bg-white p-6 shadow-card'>
            <h3 className='font-display text-lg font-bold text-royal-950'>Vendor application</h3>
            <p className='mt-1 text-sm text-royal-900/60'>{STATUS_COPY[application.status]}</p>
          </div>
        )}

        {canApply && (
          <div className='rounded-2xl border border-royal-100 bg-white p-6 shadow-card'>
            <h3 className='font-display text-lg font-bold text-royal-950'>Apply to become a vendor</h3>
            <form onSubmit={handleSubmit(submit)} noValidate className='mt-4 grid max-w-lg gap-4'>
              <label className='block'>
                <span className='text-xs font-bold uppercase tracking-wider text-royal-900/50'>Business name</span>
                <input aria-invalid={!!errors.businessName} {...register('businessName')} className={inputClass} />
                {errors.businessName && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.businessName.message}</p>}
              </label>
              <label className='block'>
                <span className='text-xs font-bold uppercase tracking-wider text-royal-900/50'>Note (optional)</span>
                <textarea rows={3} {...register('note')} className={inputClass} />
                {errors.note && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.note.message}</p>}
              </label>
              <button
                type='submit'
                disabled={isSubmitting}
                className='w-fit rounded-xl bg-royal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-royal-700 disabled:opacity-50'
              >
                {isSubmitting ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}

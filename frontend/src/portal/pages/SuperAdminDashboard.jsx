import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { portalApi } from '../api'
import PortalLayout from '../components/PortalLayout'
import { createCompanySchema, createUserWithCompanySchema } from '../schemas'

const TABS = ['Companies', 'Create company', 'Create vendor / customer', 'Vendor applications']

export default function SuperAdminDashboard () {
  const [tab, setTab] = useState(TABS[0])
  const queryClient = useQueryClient()

  const companiesQuery = useQuery({
    queryKey: ['super-admin', 'companies'],
    queryFn: () => portalApi.get('/api/super-admin/companies').then(r => r.data.companies)
  })
  const applicationsQuery = useQuery({
    queryKey: ['super-admin', 'vendor-applications'],
    queryFn: () => portalApi.get('/api/super-admin/vendor-applications').then(r => r.data.applications)
  })

  const companies = companiesQuery.data ?? []
  const applications = applicationsQuery.data ?? []
  const loading = companiesQuery.isLoading || applicationsQuery.isLoading
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['super-admin'] })

  return (
    <PortalLayout title='Super Admin'>
      <div className='mb-6 flex flex-wrap gap-2'>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === t ? 'border-royal-600 bg-royal-600 text-white' : 'border-royal-200 text-royal-800 hover:bg-royal-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {(companiesQuery.error || applicationsQuery.error) && (
        <p className='mb-4 text-sm font-semibold text-rose-600'>
          {(companiesQuery.error || applicationsQuery.error).message}
        </p>
      )}

      {loading
        ? <p className='text-sm text-royal-900/50'>Loading…</p>
        : (
          <>
            {tab === 'Companies' && <CompaniesTab companies={companies} onChanged={refresh} />}
            {tab === 'Create company' && <CreateCompanyTab onCreated={refresh} />}
            {tab === 'Create vendor / customer' && <CreateUserTab companies={companies} />}
            {tab === 'Vendor applications' && <VendorApplicationsTab applications={applications} onChanged={refresh} />}
          </>
          )}
    </PortalLayout>
  )
}

function Card ({ children }) {
  return <div className='rounded-2xl border border-royal-100 bg-white p-5 shadow-card sm:p-6'>{children}</div>
}

function Field ({ label, error, children }) {
  return (
    <label className='block'>
      <span className='text-xs font-bold uppercase tracking-wider text-royal-900/50'>{label}</span>
      {children}
      {error && <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{error.message}</p>}
    </label>
  )
}

const inputClass =
  'mt-2 w-full rounded-xl border border-royal-200 bg-royal-50/40 px-3.5 py-2.5 text-sm text-royal-950 outline-none transition focus:border-royal-400 focus:bg-white focus:ring-4 focus:ring-royal-500/10'

function CompaniesTab ({ companies, onChanged }) {
  const toggleStatus = async company => {
    const status = company.status === 'active' ? 'suspended' : 'active'
    try {
      await portalApi.patch(`/api/super-admin/companies/${company._id}/status`, { status })
      toast.success(`${company.name} is now ${status}.`)
      onChanged()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (!companies.length) return <p className='text-sm text-royal-900/50'>No companies yet.</p>

  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <thead>
            <tr className='border-b border-royal-100 text-xs font-bold uppercase tracking-wider text-royal-900/50'>
              <th className='py-2 pr-4'>Name</th>
              <th className='py-2 pr-4'>Email</th>
              <th className='py-2 pr-4'>Slug</th>
              <th className='py-2 pr-4'>Status</th>
              <th className='py-2 pr-4' />
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c._id} className='border-b border-royal-50'>
                <td className='py-2.5 pr-4 font-semibold text-royal-950'>{c.name}</td>
                <td className='py-2.5 pr-4 text-royal-900/70'>{c.email}</td>
                <td className='py-2.5 pr-4 text-royal-900/50'>{c.slug}</td>
                <td className='py-2.5 pr-4'>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${c.status === 'active' ? 'bg-olive-50 text-olive-800' : 'bg-rose-50 text-rose-700'}`}>
                    {c.status}
                  </span>
                </td>
                <td className='py-2.5 pr-4'>
                  <button onClick={() => toggleStatus(c)} className='text-xs font-bold text-royal-700 hover:underline'>
                    {c.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function CreateCompanyTab ({ onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: '', email: '', password: '', logo: '' },
    mode: 'onTouched'
  })

  const submit = async values => {
    try {
      const payload = { ...values }
      if (!payload.logo) delete payload.logo
      const { data } = await portalApi.post('/api/super-admin/companies', payload)
      toast.success(data.emailDelivered ? 'Company created — credentials emailed.' : 'Company created — check server console for credentials (email not configured yet).')
      reset({ name: '', email: '', password: '', logo: '' })
      onCreated()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(submit)} noValidate className='grid max-w-lg gap-4'>
        <Field label='Company name' error={errors.name}>
          <input {...register('name')} className={inputClass} />
        </Field>
        <Field label='Admin email' error={errors.email}>
          <input type='email' {...register('email')} className={inputClass} />
        </Field>
        <Field label='Admin password' error={errors.password}>
          <input type='password' {...register('password')} className={inputClass} />
        </Field>
        <Field label='Logo URL (optional)' error={errors.logo}>
          <input {...register('logo')} className={inputClass} placeholder='https://…' />
        </Field>
        <button type='submit' disabled={isSubmitting} className='w-fit rounded-xl bg-royal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-royal-700 disabled:opacity-50'>
          {isSubmitting ? 'Creating…' : 'Create company'}
        </button>
      </form>
    </Card>
  )
}

function CreateUserTab ({ companies }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(createUserWithCompanySchema),
    defaultValues: { companyId: '', name: '', email: '', role: 'vendor' },
    mode: 'onTouched'
  })

  const submit = async values => {
    try {
      const { data } = await portalApi.post('/api/super-admin/users', values)
      toast.success(data.emailDelivered ? `${values.role} created — credentials emailed.` : `${values.role} created — check server console for credentials.`)
      reset({ companyId: values.companyId, name: '', email: '', role: values.role })
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(submit)} noValidate className='grid max-w-lg gap-4'>
        <Field label='Company' error={errors.companyId}>
          <select {...register('companyId')} className={inputClass}>
            <option value=''>Select a company…</option>
            {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label='Name' error={errors.name}>
          <input {...register('name')} className={inputClass} />
        </Field>
        <Field label='Email' error={errors.email}>
          <input type='email' {...register('email')} className={inputClass} />
        </Field>
        <Field label='Role' error={errors.role}>
          <select {...register('role')} className={inputClass}>
            <option value='vendor'>Vendor</option>
            <option value='customer'>Customer</option>
          </select>
        </Field>
        <button type='submit' disabled={isSubmitting} className='w-fit rounded-xl bg-royal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-royal-700 disabled:opacity-50'>
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </Card>
  )
}

function VendorApplicationsTab ({ applications, onChanged }) {
  const decide = async (userId, decision) => {
    try {
      await portalApi.patch(`/api/super-admin/vendor-applications/${userId}`, { decision })
      toast.success(`Application ${decision}.`)
      onChanged()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (!applications.length) return <p className='text-sm text-royal-900/50'>No pending applications.</p>

  return (
    <div className='grid gap-3'>
      {applications.map(app => (
        <Card key={app._id}>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <p className='font-semibold text-royal-950'>{app.name} · {app.email}</p>
              <p className='text-sm text-royal-900/60'>{app.company?.name} — applying as "{app.vendorApplication.businessName}"</p>
              {app.vendorApplication.note && <p className='mt-1 text-sm text-royal-900/50'>{app.vendorApplication.note}</p>}
            </div>
            <div className='flex gap-2'>
              <button onClick={() => decide(app._id, 'approved')} className='rounded-lg bg-olive-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-olive-700'>Approve</button>
              <button onClick={() => decide(app._id, 'rejected')} className='rounded-lg border border-rose-300 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50'>Reject</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

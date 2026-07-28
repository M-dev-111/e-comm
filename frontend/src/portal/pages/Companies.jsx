import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Plus, Trash2, Ban, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCompanies, useCompanyMutations } from '../hooks'
import {
  Button, Table, Badge, Modal, Field, Select, Spinner, EmptyState, PageHeader, formatINR
} from '../ui'

const schema = z.object({
  name: z.string().trim().min(2, 'Company name required.'),
  slug: z.string().trim().min(2, 'Store address required.').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only.'),
  plan: z.enum(['trial', 'basic', 'pro']),
  adminName: z.string().trim().min(2, 'Admin name required.'),
  adminEmail: z.email('Valid admin email required.'),
  adminPassword: z.string().min(6, 'At least 6 characters.')
})

function CreateCompanyModal ({ open, onClose }) {
  const { create } = useCompanyMutations()
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { plan: 'trial' }
  })

  const submit = async values => {
    try {
      const data = await create.mutateAsync(values)
      toast.success(`${data.company.name} created with its admin.`)
      reset(); onClose()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal open={open} onClose={onClose} title='New company' wide>
      <form onSubmit={handleSubmit(submit)} noValidate className='space-y-4'>
        <div className='grid gap-3 sm:grid-cols-2'>
          <Field label='Company name' placeholder='Aurora Store' error={errors.name?.message} {...register('name')} />
          <Field label='Store address (slug)' placeholder='aurora' hint='Customers sign in with this.' error={errors.slug?.message} {...register('slug')} />
        </div>
        <Select label='Plan' error={errors.plan?.message} {...register('plan')}>
          <option value='trial'>Trial</option>
          <option value='basic'>Basic</option>
          <option value='pro'>Pro</option>
        </Select>
        <div className='rounded-xl bg-slate-50 p-3.5'>
          <p className='mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400'>First admin account</p>
          <div className='space-y-3'>
            <Field label='Admin name' placeholder='Jane Admin' error={errors.adminName?.message} {...register('adminName')} />
            <div className='grid gap-3 sm:grid-cols-2'>
              <Field label='Admin email' type='email' placeholder='admin@aurora.com' error={errors.adminEmail?.message} {...register('adminEmail')} />
              <Field label='Temp password' type='text' placeholder='min 6 chars' error={errors.adminPassword?.message} {...register('adminPassword')} />
            </div>
          </div>
        </div>
        <div className='flex justify-end gap-2 pt-1'>
          <Button type='button' variant='ghost' onClick={onClose}>Cancel</Button>
          <Button type='submit' loading={create.isPending}>Create company</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Companies () {
  const { data, isLoading, isError, error } = useCompanies()
  const { update, remove } = useCompanyMutations()
  const [creating, setCreating] = useState(false)

  const toggleStatus = async c => {
    const status = c.status === 'active' ? 'suspended' : 'active'
    try { await update.mutateAsync({ id: c.id, body: { status } }); toast.success(`${c.name} ${status}.`) }
    catch (err) { toast.error(err.message) }
  }

  const del = async c => {
    if (!window.confirm(`Delete "${c.name}" and ALL its data (users, products, orders)? This cannot be undone.`)) return
    try { await remove.mutateAsync(c.id); toast.success(`${c.name} deleted.`) }
    catch (err) { toast.error(err.message) }
  }

  if (isLoading) return <Spinner />
  if (isError) return <p className='text-sm text-rose-500'>{error.message}</p>

  const companies = data.companies || []

  return (
    <div>
      <PageHeader
        title='Companies'
        subtitle={`${companies.length} tenant${companies.length === 1 ? '' : 's'} on the platform`}
        action={<Button onClick={() => setCreating(true)}><Plus className='h-4 w-4' /> New company</Button>}
      />

      {companies.length === 0 ? (
        <EmptyState icon={Building2} title='No companies yet' hint='Create your first tenant and its admin account.'
          action={<Button onClick={() => setCreating(true)}><Plus className='h-4 w-4' /> New company</Button>} />
      ) : (
        <Table
          columns={[
            { key: 'name', label: 'Company', render: r => (
              <div>
                <p className='font-semibold text-royal-900'>{r.name}</p>
                <code className='text-[11px] text-slate-400'>/{r.slug}</code>
              </div>
            ) },
            { key: 'plan', label: 'Plan', render: r => <Badge>{r.plan}</Badge> },
            { key: 'counts', label: 'Usage', render: r => (
              <span className='text-[12px] text-slate-500'>
                {r.counts?.users ?? 0} users · {r.counts?.products ?? 0} products · {r.counts?.orders ?? 0} orders
              </span>
            ) },
            { key: 'revenue', label: 'Revenue', render: r => formatINR(r.counts?.revenue || 0) },
            { key: 'status', label: 'Status', render: r => <Badge>{r.status}</Badge> },
            { key: 'actions', label: '', render: r => (
              <div className='flex justify-end gap-1.5'>
                <Button size='sm' variant='outline' onClick={() => toggleStatus(r)}>
                  {r.status === 'active' ? <><Ban className='h-3.5 w-3.5' /> Suspend</> : <><CheckCircle2 className='h-3.5 w-3.5' /> Activate</>}
                </Button>
                <Button size='sm' variant='danger' onClick={() => del(r)}><Trash2 className='h-3.5 w-3.5' /></Button>
              </div>
            ) }
          ]}
          rows={companies}
        />
      )}

      <CreateCompanyModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}

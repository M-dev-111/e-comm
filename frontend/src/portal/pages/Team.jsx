import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, Plus, Trash2, Ban, CheckCircle2, Store, User } from 'lucide-react'
import { toast } from 'sonner'
import { useUsers, useUserMutations } from '../hooks'
import {
  Button, Table, Badge, Modal, Field, Select, Spinner, EmptyState, PageHeader
} from '../ui'

const schema = z.object({
  name: z.string().trim().min(2, 'Name required.'),
  email: z.email('Valid email required.'),
  password: z.string().min(6, 'At least 6 characters.'),
  role: z.enum(['vendor', 'customer'])
})

function CreateMemberModal ({ open, onClose }) {
  const { create } = useUserMutations()
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema), defaultValues: { role: 'vendor' }
  })
  const submit = async values => {
    try { await create.mutateAsync(values); toast.success(`${values.role} added.`); reset(); onClose() }
    catch (err) { toast.error(err.message) }
  }
  return (
    <Modal open={open} onClose={onClose} title='Add team member'>
      <form onSubmit={handleSubmit(submit)} noValidate className='space-y-3.5'>
        <Select label='Role' error={errors.role?.message} {...register('role')}>
          <option value='vendor'>Vendor — can list & manage products</option>
          <option value='customer'>Customer — can shop & order</option>
        </Select>
        <Field label='Name' placeholder='Full name' error={errors.name?.message} {...register('name')} />
        <Field label='Email' type='email' placeholder='person@store.com' error={errors.email?.message} {...register('email')} />
        <Field label='Temp password' type='text' placeholder='min 6 chars' error={errors.password?.message} {...register('password')} />
        <div className='flex justify-end gap-2 pt-1'>
          <Button type='button' variant='ghost' onClick={onClose}>Cancel</Button>
          <Button type='submit' loading={create.isPending}>Add member</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Team () {
  const [filter, setFilter] = useState('')     // '', 'vendor', 'customer'
  const [creating, setCreating] = useState(false)
  const { data, isLoading, isError, error } = useUsers(filter ? { role: filter } : undefined)
  const { update, remove } = useUserMutations()

  const toggle = async u => {
    const status = u.status === 'active' ? 'disabled' : 'active'
    try { await update.mutateAsync({ id: u.id, body: { status } }); toast.success(`${u.name} ${status}.`) }
    catch (err) { toast.error(err.message) }
  }
  const del = async u => {
    if (!window.confirm(`Delete ${u.name}?`)) return
    try { await remove.mutateAsync(u.id); toast.success(`${u.name} deleted.`) }
    catch (err) { toast.error(err.message) }
  }

  if (isLoading) return <Spinner />
  if (isError) return <p className='text-sm text-rose-500'>{error.message}</p>

  const users = data.users || []
  const tabs = [{ v: '', label: 'All' }, { v: 'vendor', label: 'Vendors' }, { v: 'customer', label: 'Customers' }]

  return (
    <div>
      <PageHeader
        title='Team'
        subtitle='Vendors and customers of your store'
        action={<Button onClick={() => setCreating(true)}><Plus className='h-4 w-4' /> Add member</Button>}
      />

      <div className='mb-4 inline-flex rounded-xl border border-slate-200 bg-white p-1'>
        {tabs.map(t => (
          <button key={t.v} onClick={() => setFilter(t.v)}
            className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${filter === t.v ? 'bg-royal-600 text-white' : 'text-slate-500 hover:text-royal-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title='No members yet' hint='Add vendors to sell, or customers to shop.'
          action={<Button onClick={() => setCreating(true)}><Plus className='h-4 w-4' /> Add member</Button>} />
      ) : (
        <Table
          columns={[
            { key: 'name', label: 'Member', render: r => (
              <div className='flex items-center gap-3'>
                <span className={`grid h-9 w-9 place-items-center rounded-full ${r.role === 'vendor' ? 'bg-olive-100 text-olive-700' : 'bg-royal-100 text-royal-700'}`}>
                  {r.role === 'vendor' ? <Store className='h-4 w-4' /> : <User className='h-4 w-4' />}
                </span>
                <div><p className='font-semibold text-royal-900'>{r.name}</p><p className='text-[11px] text-slate-400'>{r.email}</p></div>
              </div>
            ) },
            { key: 'role', label: 'Role', render: r => <Badge>{r.role}</Badge> },
            { key: 'status', label: 'Status', render: r => <Badge>{r.status}</Badge> },
            { key: 'actions', label: '', render: r => (
              <div className='flex justify-end gap-1.5'>
                <Button size='sm' variant='outline' onClick={() => toggle(r)}>
                  {r.status === 'active' ? <><Ban className='h-3.5 w-3.5' /> Disable</> : <><CheckCircle2 className='h-3.5 w-3.5' /> Enable</>}
                </Button>
                <Button size='sm' variant='danger' onClick={() => del(r)}><Trash2 className='h-3.5 w-3.5' /></Button>
              </div>
            ) }
          ]}
          rows={users}
        />
      )}

      <CreateMemberModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}

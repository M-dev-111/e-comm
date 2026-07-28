import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePortalAuth } from '../PortalAuthContext'
import { useProducts, useProductMutations } from '../hooks'
import {
  Button, Table, Badge, Modal, Field, Select, Textarea, Spinner, EmptyState, PageHeader, formatINR
} from '../ui'

const schema = z.object({
  name: z.string().trim().min(2, 'Product name required.'),
  brand: z.string().trim().optional(),
  category: z.string().trim().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or more.'),
  mrp: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
  stock: z.coerce.number().int().min(0, 'Stock must be 0 or more.'),
  image: z.union([z.string().url('Must be a valid URL.'), z.literal('')]).optional(),
  status: z.enum(['active', 'draft', 'archived']),
  description: z.string().trim().optional()
})

function ProductModal ({ open, onClose, editing }) {
  const { create, update } = useProductMutations()
  const isEdit = !!editing
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    values: editing
      ? { ...editing, mrp: editing.mrp ?? '', image: editing.image ?? '', description: editing.description ?? '' }
      : { status: 'active', stock: 0, category: 'general', price: 0 }
  })

  const submit = async values => {
    const body = { ...values }
    if (body.mrp === '' || body.mrp == null) delete body.mrp
    if (body.image === '') delete body.image
    try {
      if (isEdit) { await update.mutateAsync({ id: editing.id, body }); toast.success('Product updated.') }
      else { await create.mutateAsync(body); toast.success('Product added.') }
      reset(); onClose()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit product' : 'New product'} wide>
      <form onSubmit={handleSubmit(submit)} noValidate className='space-y-3.5'>
        <Field label='Name' placeholder='Wireless Earbuds' error={errors.name?.message} {...register('name')} />
        <div className='grid gap-3 sm:grid-cols-2'>
          <Field label='Brand' placeholder='Aurora Audio' error={errors.brand?.message} {...register('brand')} />
          <Field label='Category' placeholder='electronics' error={errors.category?.message} {...register('category')} />
        </div>
        <div className='grid gap-3 sm:grid-cols-3'>
          <Field label='Price (₹)' type='number' step='1' error={errors.price?.message} {...register('price')} />
          <Field label='MRP (₹)' type='number' step='1' error={errors.mrp?.message} {...register('mrp')} />
          <Field label='Stock' type='number' step='1' error={errors.stock?.message} {...register('stock')} />
        </div>
        <Field label='Image URL' placeholder='https://…' error={errors.image?.message} {...register('image')} />
        <Textarea label='Description' rows={3} placeholder='Short product description' error={errors.description?.message} {...register('description')} />
        <Select label='Status' error={errors.status?.message} {...register('status')}>
          <option value='active'>Active (visible to customers)</option>
          <option value='draft'>Draft (hidden)</option>
          <option value='archived'>Archived</option>
        </Select>
        <div className='flex justify-end gap-2 pt-1'>
          <Button type='button' variant='ghost' onClick={onClose}>Cancel</Button>
          <Button type='submit' loading={create.isPending || update.isPending}>{isEdit ? 'Save changes' : 'Add product'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Products () {
  const { user } = usePortalAuth()
  const isAdmin = user.role === 'admin'
  const { data, isLoading, isError, error } = useProducts()
  const { remove } = useProductMutations()
  const [modal, setModal] = useState({ open: false, editing: null })

  const del = async p => {
    if (!window.confirm(`Delete "${p.name}"?`)) return
    try { await remove.mutateAsync(p.id); toast.success('Product deleted.') }
    catch (err) { toast.error(err.message) }
  }

  if (isLoading) return <Spinner />
  if (isError) return <p className='text-sm text-rose-500'>{error.message}</p>

  const products = data.products || []

  const columns = [
    { key: 'name', label: 'Product', render: r => (
      <div className='flex items-center gap-3'>
        {r.image
          ? <img src={r.image} alt='' className='h-10 w-10 shrink-0 rounded-lg object-cover' />
          : <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-300'><Package className='h-5 w-5' /></span>}
        <div>
          <p className='font-semibold text-royal-900'>{r.name}</p>
          <p className='text-[11px] text-slate-400'>{r.brand || '—'} · {r.category}</p>
        </div>
      </div>
    ) },
    { key: 'price', label: 'Price', render: r => formatINR(r.price) },
    { key: 'stock', label: 'Stock', render: r => (
      <span className={r.stock <= 5 ? 'font-bold text-rose-600' : 'text-slate-700'}>{r.stock}</span>
    ) },
    ...(isAdmin ? [{ key: 'vendor', label: 'Vendor', render: r => <span className='text-[12px] text-slate-500'>{r.vendor?.name || '—'}</span> }] : []),
    { key: 'status', label: 'Status', render: r => <Badge>{r.status}</Badge> },
    { key: 'actions', label: '', render: r => (
      <div className='flex justify-end gap-1.5'>
        <Button size='sm' variant='outline' onClick={() => setModal({ open: true, editing: r })}><Pencil className='h-3.5 w-3.5' /></Button>
        <Button size='sm' variant='danger' onClick={() => del(r)}><Trash2 className='h-3.5 w-3.5' /></Button>
      </div>
    ) }
  ]

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'Products' : 'My products'}
        subtitle={`${products.length} item${products.length === 1 ? '' : 's'}${isAdmin ? ' across your store' : ''}`}
        action={<Button onClick={() => setModal({ open: true, editing: null })}><Plus className='h-4 w-4' /> Add product</Button>}
      />

      {products.length === 0 ? (
        <EmptyState icon={Package} title='No products yet' hint='Add your first product to start selling.'
          action={<Button onClick={() => setModal({ open: true, editing: null })}><Plus className='h-4 w-4' /> Add product</Button>} />
      ) : (
        <Table columns={columns} rows={products} />
      )}

      <ProductModal open={modal.open} editing={modal.editing} onClose={() => setModal({ open: false, editing: null })} />
    </div>
  )
}

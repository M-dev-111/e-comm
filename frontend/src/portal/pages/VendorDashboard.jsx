import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { portalApi } from '../api'
import { usePortalAuth } from '../PortalAuthContext'
import PortalLayout from '../components/PortalLayout'
import { productFormSchema, productToFormValues, EMPTY_PRODUCT_FORM } from '../schemas'

const TABS = ['My products', 'Add product']

const inputClass =
  'mt-2 w-full rounded-xl border border-royal-200 bg-royal-50/40 px-3.5 py-2.5 text-sm text-royal-950 outline-none transition focus:border-royal-400 focus:bg-white focus:ring-4 focus:ring-royal-500/10'

function Card ({ children }) {
  return <div className='rounded-2xl border border-royal-100 bg-white p-5 shadow-card sm:p-6'>{children}</div>
}

function Field ({ label, error, children }) {
  return (
    <label className='block'>
      <span className='text-xs font-bold uppercase tracking-wider text-royal-900/50'>{label}</span>
      {children}
      {error && <p className='mt-1 text-[12px] font-semibold text-rose-500'>{error.message}</p>}
    </label>
  )
}

export default function VendorDashboard () {
  const { user } = usePortalAuth()
  const [tab, setTab] = useState(TABS[0])
  const [editing, setEditing] = useState(null)
  const queryClient = useQueryClient()

  const productsQuery = useQuery({
    queryKey: ['vendor', 'products'],
    queryFn: () => portalApi.get('/api/vendor/products').then(r => r.data.products)
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] })

  const startEdit = product => {
    setEditing(product)
    setTab('Add product')
  }

  const stopEditing = () => setEditing(null)

  return (
    <PortalLayout title={user?.name ? `${user.name} — Vendor` : 'Vendor'}>
      <div className='mb-6 flex flex-wrap gap-2'>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => {
              setTab(t)
              if (t === 'My products') stopEditing()
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === t ? 'border-royal-600 bg-royal-600 text-white' : 'border-royal-200 text-royal-800 hover:bg-royal-50'
            }`}
          >
            {t === 'Add product' && editing ? 'Edit product' : t}
          </button>
        ))}
      </div>

      {productsQuery.error && (
        <p className='mb-4 text-sm font-semibold text-rose-600'>{productsQuery.error.message}</p>
      )}

      {tab === 'My products' && (
        <ProductsTab
          products={productsQuery.data ?? []}
          loading={productsQuery.isLoading}
          onChanged={refresh}
          onEdit={startEdit}
        />
      )}
      {tab === 'Add product' && (
        <ProductForm
          key={editing?.id ?? 'new'}
          editing={editing}
          onSaved={() => {
            refresh()
            stopEditing()
            setTab('My products')
          }}
          onCancel={() => {
            stopEditing()
            setTab('My products')
          }}
        />
      )}
    </PortalLayout>
  )
}

function ProductsTab ({ products, loading, onChanged, onEdit }) {
  const toggleStatus = async product => {
    const status = product.status === 'active' ? 'inactive' : 'active'
    try {
      await portalApi.patch(`/api/vendor/products/${product.id}`, { status })
      toast.success(`${product.name} is now ${status}.`)
      onChanged()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const remove = async product => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      await portalApi.delete(`/api/vendor/products/${product.id}`)
      toast.success(`${product.name} deleted.`)
      onChanged()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return <p className='text-sm text-royal-900/50'>Loading…</p>
  if (!products.length) return <p className='text-sm text-royal-900/50'>You have not listed any products yet.</p>

  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <thead>
            <tr className='border-b border-royal-100 text-xs font-bold uppercase tracking-wider text-royal-900/50'>
              <th className='py-2 pr-4'>Product</th>
              <th className='py-2 pr-4'>Category</th>
              <th className='py-2 pr-4'>Price</th>
              <th className='py-2 pr-4'>Stock</th>
              <th className='py-2 pr-4'>Status</th>
              <th className='py-2 pr-4' />
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className='border-b border-royal-50'>
                <td className='py-2.5 pr-4'>
                  <div className='flex items-center gap-2.5'>
                    <img src={p.images?.[0]} alt='' className='h-10 w-10 rounded-lg object-cover' />
                    <span className='max-w-56 truncate font-semibold text-royal-950'>{p.name}</span>
                  </div>
                </td>
                <td className='py-2.5 pr-4 capitalize text-royal-900/70'>{p.category}</td>
                <td className='py-2.5 pr-4 text-royal-900/70'>₹{p.price.toLocaleString('en-IN')}</td>
                <td className='py-2.5 pr-4 text-royal-900/70'>{p.stock}</td>
                <td className='py-2.5 pr-4'>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.status === 'active' ? 'bg-olive-50 text-olive-800' : 'bg-rose-50 text-rose-700'}`}>
                    {p.status}
                  </span>
                </td>
                <td className='py-2.5 pr-4'>
                  <div className='flex gap-3'>
                    <button onClick={() => onEdit(p)} className='text-xs font-bold text-royal-700 hover:underline'>Edit</button>
                    <button onClick={() => toggleStatus(p)} className='text-xs font-bold text-royal-700 hover:underline'>
                      {p.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => remove(p)} className='text-xs font-bold text-rose-600 hover:underline'>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function ProductForm ({ editing, onSaved, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: editing ? productToFormValues(editing) : EMPTY_PRODUCT_FORM,
    mode: 'onTouched'
  })

  const submit = async values => {
    try {
      if (editing) {
        await portalApi.patch(`/api/vendor/products/${editing.id}`, values)
        toast.success('Product updated.')
      } else {
        await portalApi.post('/api/vendor/products', values)
        toast.success('Product created.')
      }
      onSaved()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(submit)} noValidate className='grid gap-4 sm:grid-cols-2'>
        <Field label='Name' error={errors.name}>
          <input {...register('name')} className={inputClass} />
        </Field>
        <Field label='Brand' error={errors.brand}>
          <input {...register('brand')} className={inputClass} />
        </Field>

        <Field label='Category' error={errors.category}>
          <input {...register('category')} className={inputClass} placeholder='e.g. electronics' />
        </Field>
        <Field label='Tags (comma separated)' error={errors.tags}>
          <input {...register('tags')} className={inputClass} placeholder='bestseller, deal' />
        </Field>

        <Field label='Price (₹)' error={errors.price}>
          <input {...register('price')} type='number' step='1' className={inputClass} />
        </Field>
        <Field label='MRP (₹)' error={errors.mrp}>
          <input {...register('mrp')} type='number' step='1' className={inputClass} />
        </Field>

        <Field label='Stock' error={errors.stock}>
          <input {...register('stock')} type='number' step='1' className={inputClass} />
        </Field>
        <Field label='Delivery days' error={errors.deliveryDays}>
          <input {...register('deliveryDays')} type='number' step='1' className={inputClass} />
        </Field>

        <Field label='Colors (comma separated, optional)' error={errors.colors}>
          <input {...register('colors')} className={inputClass} placeholder='Black, Silver' />
        </Field>
        <Field label='Sizes (comma separated, optional)' error={errors.sizes}>
          <input {...register('sizes')} className={inputClass} placeholder='S, M, L' />
        </Field>

        <div className='sm:col-span-2'>
          <Field label='Description' error={errors.description}>
            <textarea {...register('description')} rows={3} className={inputClass} />
          </Field>
        </div>

        <div className='sm:col-span-2'>
          <Field label='Image URLs (one per line)' error={errors.images}>
            <textarea {...register('images')} rows={3} className={inputClass} placeholder='https://…' />
          </Field>
        </div>

        <div className='sm:col-span-2'>
          <Field label='Highlights (one per line, optional)' error={errors.highlights}>
            <textarea {...register('highlights')} rows={3} className={inputClass} />
          </Field>
        </div>

        <div className='flex gap-3 sm:col-span-2'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-fit rounded-xl bg-royal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-royal-700 disabled:opacity-50'
          >
            {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
          </button>
          {editing && (
            <button type='button' onClick={onCancel} className='rounded-xl px-5 py-2.5 text-sm font-bold text-royal-800 transition hover:bg-royal-50'>
              Cancel
            </button>
          )}
        </div>
      </form>
    </Card>
  )
}

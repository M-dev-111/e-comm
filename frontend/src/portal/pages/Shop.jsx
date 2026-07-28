import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, Minus, ShoppingCart, Store } from 'lucide-react'
import { toast } from 'sonner'
import { usePortalAuth } from '../PortalAuthContext'
import { useProducts, useOrderMutations } from '../hooks'
import { Button, Spinner, EmptyState, PageHeader, formatINR } from '../ui'

export default function Shop () {
  const { user } = usePortalAuth()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useProducts()
  const { create } = useOrderMutations()
  const [cart, setCart] = useState({}) // productId -> qty

  const products = useMemo(() => (data?.products || []).filter(p => p.stock > 0), [data])

  const setQty = (id, delta, max) =>
    setCart(prev => {
      const next = Math.max(0, Math.min(max, (prev[id] || 0) + delta))
      const copy = { ...prev }
      if (next === 0) delete copy[id]; else copy[id] = next
      return copy
    })

  const lines = Object.entries(cart)
  const total = lines.reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === id)
    return sum + (p ? p.price * qty : 0)
  }, 0)

  const placeOrder = async () => {
    try {
      await create.mutateAsync({ items: lines.map(([product, qty]) => ({ product, qty })) })
      toast.success('Order placed!')
      setCart({})
      navigate('/portal/orders')
    } catch (err) { toast.error(err.message) }
  }

  if (isLoading) return <Spinner />
  if (isError) return <p className='text-sm text-rose-500'>{error.message}</p>

  return (
    <div>
      <PageHeader title={`Shop at ${user.company?.name || 'the store'}`} subtitle='Products available for you to buy' />

      {products.length === 0 ? (
        <EmptyState icon={Store} title='Nothing in stock yet' hint='Check back soon — this store has no available products right now.' />
      ) : (
        <div className='grid gap-4 lg:grid-cols-[1fr_300px] lg:items-start'>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {products.map(p => (
              <div key={p.id} className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card'>
                <div className='aspect-square bg-slate-100'>
                  {p.image
                    ? <img src={p.image} alt={p.name} className='h-full w-full object-cover' />
                    : <span className='grid h-full w-full place-items-center text-slate-300'><Package className='h-8 w-8' /></span>}
                </div>
                <div className='p-3'>
                  <p className='truncate text-[13px] font-bold text-royal-900'>{p.name}</p>
                  <p className='text-[11px] text-slate-400'>{p.brand || p.category}</p>
                  <div className='mt-1.5 flex items-center justify-between'>
                    <span className='font-display font-extrabold text-royal-950'>{formatINR(p.price)}</span>
                    {p.mrp > p.price && <span className='text-[11px] text-slate-400 line-through'>{formatINR(p.mrp)}</span>}
                  </div>
                  {cart[p.id] ? (
                    <div className='mt-2 flex items-center justify-between rounded-lg bg-royal-50 p-1'>
                      <button onClick={() => setQty(p.id, -1, p.stock)} className='grid h-7 w-7 place-items-center rounded-md bg-white text-royal-700 shadow-sm'><Minus className='h-3.5 w-3.5' /></button>
                      <span className='text-[13px] font-bold text-royal-900'>{cart[p.id]}</span>
                      <button onClick={() => setQty(p.id, 1, p.stock)} className='grid h-7 w-7 place-items-center rounded-md bg-white text-royal-700 shadow-sm'><Plus className='h-3.5 w-3.5' /></button>
                    </div>
                  ) : (
                    <Button size='sm' variant='olive' className='mt-2 w-full' onClick={() => setQty(p.id, 1, p.stock)}>
                      <Plus className='h-3.5 w-3.5' /> Add
                    </Button>
                  )}
                  <p className='mt-1 text-center text-[10px] text-slate-400'>{p.stock} in stock</p>
                </div>
              </div>
            ))}
          </div>

          {/* cart summary */}
          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-card lg:sticky lg:top-6'>
            <p className='flex items-center gap-2 font-display font-bold text-royal-950'><ShoppingCart className='h-4.5 w-4.5' /> Your cart</p>
            {lines.length === 0 ? (
              <p className='mt-3 text-[13px] text-slate-400'>Add products to get started.</p>
            ) : (
              <>
                <div className='mt-3 space-y-2'>
                  {lines.map(([id, qty]) => {
                    const p = products.find(x => x.id === id)
                    if (!p) return null
                    return (
                      <div key={id} className='flex items-center justify-between text-[12.5px]'>
                        <span className='truncate pr-2 text-slate-600'>{qty} × {p.name}</span>
                        <span className='font-semibold text-royal-900'>{formatINR(p.price * qty)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className='mt-3 flex items-center justify-between border-t border-slate-100 pt-3'>
                  <span className='text-[13px] font-bold text-slate-500'>Total</span>
                  <span className='font-display text-lg font-extrabold text-royal-950'>{formatINR(total)}</span>
                </div>
                <Button className='mt-3 w-full' loading={create.isPending} onClick={placeOrder}>Place order</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

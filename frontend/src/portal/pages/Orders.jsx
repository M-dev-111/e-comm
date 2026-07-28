import { ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { usePortalAuth } from '../PortalAuthContext'
import { useOrders, useOrderMutations } from '../hooks'
import { Table, Badge, Spinner, EmptyState, PageHeader, formatINR } from '../ui'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

export default function Orders () {
  const { user } = usePortalAuth()
  const canManage = user.role === 'admin' || user.role === 'vendor'
  const { data, isLoading, isError, error } = useOrders()
  const { setStatus } = useOrderMutations()

  const change = async (order, status) => {
    try { await setStatus.mutateAsync({ id: order.id, status }); toast.success(`Order marked ${status}.`) }
    catch (err) { toast.error(err.message) }
  }

  if (isLoading) return <Spinner />
  if (isError) return <p className='text-sm text-rose-500'>{error.message}</p>

  const orders = data.orders || []

  const columns = [
    { key: 'id', label: 'Order', render: r => <code className='text-[11px] text-slate-500'>#{r.id.slice(-6)}</code> },
    ...(user.role !== 'customer'
      ? [{ key: 'customer', label: 'Customer', render: r => (
          <div><p className='font-semibold text-royal-900'>{r.customer?.name || '—'}</p>
          <p className='text-[11px] text-slate-400'>{r.customer?.email}</p></div>
        ) }]
      : []),
    { key: 'items', label: 'Items', render: r => (
      <span className='text-[12px] text-slate-600'>{r.items.reduce((n, i) => n + i.qty, 0)} × {r.items.length === 1 ? r.items[0].name : `${r.items.length} products`}</span>
    ) },
    { key: 'total', label: 'Total', render: r => <span className='font-semibold'>{formatINR(r.total)}</span> },
    { key: 'status', label: 'Status', render: r =>
      canManage
        ? (
          <select
            value={r.status}
            onChange={e => change(r, e.target.value)}
            className='rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px] font-semibold capitalize outline-none focus:border-royal-400'
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )
        : <Badge>{r.status}</Badge>
    },
    { key: 'createdAt', label: 'Placed', render: r => <span className='text-[12px] text-slate-400'>{new Date(r.createdAt).toLocaleDateString()}</span> }
  ]

  return (
    <div>
      <PageHeader
        title={user.role === 'customer' ? 'My orders' : 'Orders'}
        subtitle={`${orders.length} order${orders.length === 1 ? '' : 's'}${user.role === 'vendor' ? ' involving your products' : ''}`}
      />
      {orders.length === 0
        ? <EmptyState icon={ShoppingBag} title='No orders yet' hint={user.role === 'customer' ? 'Your placed orders will appear here.' : 'Orders from customers will appear here.'} />
        : <Table columns={columns} rows={orders} />}
    </div>
  )
}

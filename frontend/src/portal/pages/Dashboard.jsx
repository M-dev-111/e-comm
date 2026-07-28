import { Link } from 'react-router-dom'
import {
  Building2, Users, Package, ShoppingBag, IndianRupee, Store, TrendingUp, AlertTriangle
} from 'lucide-react'
import { usePortalAuth } from '../PortalAuthContext'
import { useDashboard } from '../hooks'
import { StatCard, Spinner, PageHeader, Badge, Table, formatINR } from '../ui'

const GREETING = { superadmin: 'Platform overview', admin: 'Store overview', vendor: 'Your storefront', customer: 'Your account' }

export default function Dashboard () {
  const { user } = usePortalAuth()
  const { data, isLoading, isError, error } = useDashboard()

  if (isLoading) return <Spinner />
  if (isError) return <p className='text-sm text-rose-500'>{error.message}</p>

  const c = data.cards

  return (
    <div>
      <PageHeader
        title={`Hello, ${user.name.split(' ')[0]}`}
        subtitle={`${GREETING[user.role]}${user.company ? ` · ${user.company.name}` : ''}`}
      />

      {user.role === 'superadmin' && (
        <>
          <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5'>
            <StatCard label='Companies' value={c.companies} icon={Building2} />
            <StatCard label='Users' value={c.users} icon={Users} />
            <StatCard label='Products' value={c.products} icon={Package} accent='olive' />
            <StatCard label='Orders' value={c.orders} icon={ShoppingBag} />
            <StatCard label='Revenue' value={c.revenue} money icon={IndianRupee} accent='olive' />
          </div>
          <div className='mt-6'>
            <PageHeader title='Recent companies' action={<Link to='/portal/companies' className='text-[13px] font-bold text-royal-600 hover:text-royal-800'>Manage all →</Link>} />
            <Table
              columns={[
                { key: 'name', label: 'Company', render: r => <span className='font-semibold text-royal-900'>{r.name}</span> },
                { key: 'slug', label: 'Store', render: r => <code className='rounded bg-slate-100 px-1.5 py-0.5 text-[11px]'>{r.slug}</code> },
                { key: 'plan', label: 'Plan', render: r => <Badge>{r.plan}</Badge> },
                { key: 'status', label: 'Status', render: r => <Badge>{r.status}</Badge> }
              ]}
              rows={data.recentCompanies || []}
            />
          </div>
        </>
      )}

      {user.role === 'admin' && (
        <>
          <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5'>
            <StatCard label='Vendors' value={c.vendors} icon={Store} />
            <StatCard label='Customers' value={c.customers} icon={Users} />
            <StatCard label='Products' value={c.products} icon={Package} accent='olive' />
            <StatCard label='Orders' value={c.orders} icon={ShoppingBag} />
            <StatCard label='Revenue' value={c.revenue} money icon={IndianRupee} accent='olive' />
          </div>
          <div className='mt-6'>
            <PageHeader title='Recent orders' action={<Link to='/portal/orders' className='text-[13px] font-bold text-royal-600 hover:text-royal-800'>View all →</Link>} />
            <Table
              columns={[
                { key: 'customer', label: 'Customer', render: r => <span className='font-semibold text-royal-900'>{r.customer}</span> },
                { key: 'total', label: 'Total', render: r => formatINR(r.total) },
                { key: 'status', label: 'Status', render: r => <Badge>{r.status}</Badge> }
              ]}
              rows={data.recentOrders || []}
              empty={<p className='rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400'>No orders yet.</p>}
            />
          </div>
        </>
      )}

      {user.role === 'vendor' && (
        <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5'>
          <StatCard label='Products' value={c.products} icon={Package} />
          <StatCard label='Low stock' value={c.lowStock} hint='5 or fewer left' icon={AlertTriangle} accent={c.lowStock ? 'olive' : 'royal'} />
          <StatCard label='Orders' value={c.orders} icon={ShoppingBag} />
          <StatCard label='Units sold' value={c.unitsSold} icon={TrendingUp} accent='olive' />
          <StatCard label='Revenue' value={c.revenue} money icon={IndianRupee} accent='olive' />
        </div>
      )}

      {user.role === 'customer' && (
        <div className='grid grid-cols-2 gap-3 sm:gap-4'>
          <StatCard label='My orders' value={c.orders} icon={ShoppingBag} />
          <StatCard label='Total spent' value={c.spent} money icon={IndianRupee} accent='olive' />
        </div>
      )}
    </div>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { portalApi } from './portalApi'

/* Thin TanStack Query wrappers over the SaaS API. Each list keeps its own
   query key so a mutation can invalidate exactly what changed. */

const get = url => portalApi.get(url).then(r => r.data)

export const keys = {
  dashboard: ['dashboard'],
  companies: ['companies'],
  users: filters => ['users', filters || {}],
  products: filters => ['products', filters || {}],
  orders: filters => ['orders', filters || {}]
}

export function useDashboard () {
  return useQuery({ queryKey: keys.dashboard, queryFn: () => get('/api/dashboard/stats') })
}

/* ------- companies (super admin) ------- */
export function useCompanies () {
  return useQuery({ queryKey: keys.companies, queryFn: () => get('/api/companies') })
}
export function useCompanyMutations () {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: keys.companies })
    qc.invalidateQueries({ queryKey: keys.dashboard })
  }
  return {
    create: useMutation({ mutationFn: body => portalApi.post('/api/companies', body).then(r => r.data), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, body }) => portalApi.patch(`/api/companies/${id}`, body).then(r => r.data), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: id => portalApi.delete(`/api/companies/${id}`).then(r => r.data), onSuccess: invalidate })
  }
}

/* ------- users (admin / super admin) ------- */
export function useUsers (filters) {
  const qs = filters?.role ? `?role=${filters.role}` : ''
  return useQuery({ queryKey: keys.users(filters), queryFn: () => get(`/api/users${qs}`) })
}
export function useUserMutations () {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['users'] })
    qc.invalidateQueries({ queryKey: keys.dashboard })
  }
  return {
    create: useMutation({ mutationFn: body => portalApi.post('/api/users', body).then(r => r.data), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, body }) => portalApi.patch(`/api/users/${id}`, body).then(r => r.data), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: id => portalApi.delete(`/api/users/${id}`).then(r => r.data), onSuccess: invalidate })
  }
}

/* ------- products ------- */
export function useProducts (filters) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.category) params.set('category', filters.category)
  const qs = params.toString() ? `?${params}` : ''
  return useQuery({ queryKey: keys.products(filters), queryFn: () => get(`/api/products${qs}`) })
}
export function useProductMutations () {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['products'] })
    qc.invalidateQueries({ queryKey: keys.dashboard })
  }
  return {
    create: useMutation({ mutationFn: body => portalApi.post('/api/products', body).then(r => r.data), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, body }) => portalApi.patch(`/api/products/${id}`, body).then(r => r.data), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: id => portalApi.delete(`/api/products/${id}`).then(r => r.data), onSuccess: invalidate })
  }
}

/* ------- orders ------- */
export function useOrders (filters) {
  return useQuery({ queryKey: keys.orders(filters), queryFn: () => get('/api/orders') })
}
export function useOrderMutations () {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['orders'] })
    qc.invalidateQueries({ queryKey: keys.dashboard })
  }
  return {
    create: useMutation({ mutationFn: body => portalApi.post('/api/orders', body).then(r => r.data), onSuccess: invalidate }),
    setStatus: useMutation({ mutationFn: ({ id, status }) => portalApi.patch(`/api/orders/${id}/status`, { status }).then(r => r.data), onSuccess: invalidate })
  }
}

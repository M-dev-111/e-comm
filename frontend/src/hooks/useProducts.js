import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'

const TENANT = import.meta.env.VITE_TENANT_SLUG || 'demo'

export const productKeys = {
  catalogue: ['products', TENANT],
  detail: id => ['product', id]
}

/**
 * The tenant's full active catalogue, fetched once and cached. Every product
 * screen (listing, home rails, search, cart/wishlist resolution, the shopping
 * assistant) filters or looks up from this single cache rather than each
 * running its own network request — the catalogue is small enough that
 * client-side filtering is simpler and faster than a bespoke endpoint per view.
 */
export function useCatalogue () {
  return useQuery({
    queryKey: productKeys.catalogue,
    queryFn: async () => (await api.get('/api/products', { params: { tenant: TENANT, limit: 200 } })).data.products,
    staleTime: 60_000
  })
}

/** Single product detail — a real network call, so it has its own 404 path. */
export function useProduct (id) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => (await api.get(`/api/products/${id}`)).data.product,
    enabled: !!id,
    retry: false
  })
}

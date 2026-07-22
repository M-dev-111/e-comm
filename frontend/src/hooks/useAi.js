import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'

export const aiKeys = {
  all: ['ai'],
  health: () => [...aiKeys.all, 'health']
}

/**
 * Key health probe. Disabled by default so it only runs when a component
 * explicitly opts in (or calls refetch), never on mount app-wide.
 */
export function useAiHealth ({ enabled = false } = {}) {
  return useQuery({
    queryKey: aiKeys.health(),
    queryFn: async () => (await api.get('/api/ai/health')).data,
    enabled,
    staleTime: 30_000,
    retry: false
  })
}

/** Send a prompt to Gemini via the backend. */
export function useAskAi (options = {}) {
  return useMutation({
    mutationKey: [...aiKeys.all, 'ask'],
    mutationFn: async message => (await api.post('/api/ai/ask', { message })).data,
    ...options
  })
}

/**
 * One conversational turn of the shopping assistant.
 * Returns { reply, intent, showProducts, criteria, chips } — the caller
 * still picks the actual products from the local catalogue.
 */
export function useShopChat (options = {}) {
  return useMutation({
    mutationKey: [...aiKeys.all, 'chat'],
    mutationFn: async payload => (await api.post('/api/ai/chat', payload)).data,
    ...options
  })
}

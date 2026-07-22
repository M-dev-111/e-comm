import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      // 4xx are our own fault — retrying just burns rate limit.
      retry: (failureCount, error) => {
        const s = error?.status
        if (s && s >= 400 && s < 500) return false
        return failureCount < 2
      }
    },
    mutations: { retry: false }
  }
})

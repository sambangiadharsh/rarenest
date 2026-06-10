import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      // Prevents a burst of refetches when the window regains focus during navigation
      refetchOnWindowFocus: false,
      // Only retry non-auth errors once
      retry: (failureCount, error) => {
        if (error?.status === 401 || error?.status === 403) return false
        return failureCount < 1
      },
    },
  },
})

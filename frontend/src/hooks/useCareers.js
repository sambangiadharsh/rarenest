import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export const careersQueryKey = ['careers']

export function useCareers() {
  return useQuery({
    queryKey: careersQueryKey,
    queryFn: () => apiClient.get('/careers'),
  })
}

export function useCareer(id) {
  return useQuery({
    queryKey: ['careers', id],
    queryFn: () => apiClient.get(`/careers/${id}`),
    enabled: !!id,
    retry: false,
  })
}

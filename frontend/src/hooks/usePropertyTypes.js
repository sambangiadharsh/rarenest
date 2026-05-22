import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function usePropertyTypes() {
  return useQuery({
    queryKey: ['property-types', 'active'],
    queryFn: () => apiClient.get('/property-types/active'),
  })
}

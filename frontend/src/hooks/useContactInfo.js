import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export const contactInfoQueryKey = ['contact-info']

export function useContactInfo() {
  return useQuery({
    queryKey: contactInfoQueryKey,
    queryFn: () => apiClient.get('/contact-info'),
  })
}

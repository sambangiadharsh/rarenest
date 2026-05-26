import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export const contactInfoQueryKey = ['contact-info']

export function useContactInfo() {
  return useQuery({
    queryKey: contactInfoQueryKey,
    queryFn: () => apiClient.get('/contact-info'),
  })
}

export function useUpdateContactInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => apiClient.put('/contact-info', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactInfoQueryKey })
    },
  })
}

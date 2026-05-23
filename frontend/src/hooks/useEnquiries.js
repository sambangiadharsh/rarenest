import { useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function useCreateEnquiry() {
  return useMutation({
    mutationFn: (propertyId) =>
      apiClient.post('/enquiries', { property_id: propertyId }),
  })
}

export function useGuestEnquiry() {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/enquiries/guest', payload),
  })
}

import apiClient from '@/shared/lib/apiClient'

export function createEnquiry(propertyId) {
  return apiClient.post('/enquiries', { property_id: propertyId })
}

export function createGuestEnquiry(payload) {
  return apiClient.post('/enquiries/guest', payload)
}

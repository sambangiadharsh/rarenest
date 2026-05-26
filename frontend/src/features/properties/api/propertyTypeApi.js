import apiClient from '@/shared/lib/apiClient'

export function getActivePropertyTypes() {
  return apiClient.get('/property-types/active')
}

import apiClient from '@/shared/lib/apiClient'

export function getGroupedFeatures() {
  return apiClient.get('/property-features/grouped')
}

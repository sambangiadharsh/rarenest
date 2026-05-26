import apiClient from '@/shared/lib/apiClient'

export function getProperties(params) {
  return apiClient.get('/properties', { params })
}

export function verifyProperty(id, is_verified) {
  return apiClient.put(`/properties/${id}/verify`, { is_verified })
}

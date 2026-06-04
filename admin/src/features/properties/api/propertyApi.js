import apiClient from '@/shared/lib/apiClient'

export function getProperties(params) {
  return apiClient.get('/properties', { params })
}

export function getProperty(id) {
  return apiClient.get(`/properties/${id}`)
}

export function verifyProperty(id, is_verified) {
  return apiClient.put(`/properties/${id}/verify`, { is_verified })
}

export function updateProperty(id, data) {
  return apiClient.put(`/properties/${id}`, data)
}

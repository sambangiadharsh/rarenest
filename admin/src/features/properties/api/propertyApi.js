import apiClient from '@/shared/lib/apiClient'

export function getProperties(params) {
  return apiClient.get('/properties', { params })
}

export function getProperty(id) {
  return apiClient.get(`/properties/${id}`)
}

export function verifyProperty(id, { status, reason }) {
  return apiClient.put(`/properties/${id}/verify`, { status, reason })
}

export function updateProperty(id, data) {
  return apiClient.put(`/properties/${id}`, data)
}

export function toggleFeatured(id) {
  return apiClient.patch(`/properties/${id}/featured`)
}

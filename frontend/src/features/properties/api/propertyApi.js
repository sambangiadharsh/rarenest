import apiClient from '@/shared/lib/apiClient'
import uploadClient from '@/shared/lib/uploadClient'

export function getProperties(params) {
  return apiClient.get('/properties', { params })
}

export function getProperty(id) {
  return apiClient.get(`/properties/${id}`)
}

export function createProperty(data) {
  return apiClient.post('/properties', data)
}

export function updateProperty(id, data) {
  return apiClient.put(`/properties/${id}`, data)
}

export function deleteProperty(id) {
  return apiClient.delete(`/properties/${id}`)
}

export function verifyProperty(id, is_verified) {
  return apiClient.put(`/properties/${id}/verify`, { is_verified })
}

export function uploadPropertyMedia(propertyId, formData) {
  return uploadClient.post(`/properties/${propertyId}/media`, formData)
}

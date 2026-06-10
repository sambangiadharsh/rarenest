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

export function guestCreateProperty(data) {
  return apiClient.post('/properties/guest', data)
}

export function guestCreateSellerAccount(data) {
  return apiClient.post('/properties/guest-account', data)
}

export function uploadPropertyMedia(propertyId, formData) {
  return uploadClient.post(`/properties/${propertyId}/media`, formData)
}

export function deletePropertyMedia(propertyId, mediaId) {
  return apiClient.delete(`/properties/${propertyId}/media/${mediaId}`)
}

export function setPropertyThumbnail(propertyId, mediaId) {
  return apiClient.patch(`/properties/${propertyId}/media/${mediaId}/thumbnail`)
}

export function getPropertyVerificationHistory(id) {
  return apiClient.get(`/properties/${id}/verification-history`)
}

export function resubmitProperty(id) {
  return apiClient.post(`/properties/${id}/resubmit`)
}

export function getPropertyEnquiries(id) {
  return apiClient.get(`/properties/${id}/enquiries`)
}

import apiClient from '@/shared/lib/apiClient'

export function getPropertyTypes() {
  return apiClient.get('/property-types')
}

export function createPropertyType(data) {
  return apiClient.post('/property-types', data)
}

export function updatePropertyType(id, data) {
  return apiClient.put(`/property-types/${id}`, data)
}

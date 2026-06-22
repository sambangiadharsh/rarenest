import apiClient from '@/shared/lib/apiClient'

export function getCategories(params) {
  return apiClient.get('/property-feature-categories', { params })
}

export function createCategory(data) {
  return apiClient.post('/property-feature-categories', data)
}

export function updateCategory(id, data) {
  return apiClient.put(`/property-feature-categories/${id}`, data)
}

export function getFeatures(params) {
  return apiClient.get('/property-features', { params })
}

export function createFeature(data) {
  return apiClient.post('/property-features', data)
}

export function updateFeature(id, data) {
  return apiClient.put(`/property-features/${id}`, data)
}

import apiClient from '@/shared/lib/apiClient'
import uploadClient from '@/shared/lib/uploadClient'

export function getAllBuilders() {
  return apiClient.get('/builders')
}

export function getBuilderProfile(builderId) {
  return apiClient.get(`/builders/${builderId}`)
}

export function getBuilderByUser(userId) {
  return apiClient.get(`/builders/by-user/${userId}`)
}

export function getBuilderReviews(builderId) {
  return apiClient.get(`/builders/${builderId}/reviews`)
}

export function submitBuilderReview(builderId, data) {
  return apiClient.post(`/builders/${builderId}/reviews`, data)
}

export function getMyBuilderApplication() {
  return apiClient.get('/builders/applications/my')
}

export function submitBuilderApplication(data, config = {}) {
  return uploadClient.post('/builders/applications', data, config)
}

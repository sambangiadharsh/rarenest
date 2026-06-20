import apiClient from '@/shared/lib/apiClient'

export function getAllApplications() {
  return apiClient.get('/builders/applications')
}

export function reviewApplication(id, { status }) {
  return apiClient.put(`/builders/applications/${id}`, { status })
}

export function getAllBuilders() {
  return apiClient.get('/builders')
}

export function toggleBuilderFeatured(builderId) {
  return apiClient.patch(`/builders/${builderId}/featured`)
}

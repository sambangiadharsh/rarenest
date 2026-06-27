import apiClient from '@/shared/lib/apiClient'
import uploadClient from '@/shared/lib/uploadClient'

export function getPropertyDraft(params) {
  return apiClient.get('/property-drafts', { params })
}

export function upsertPropertyDraft(data) {
  return apiClient.post('/property-drafts', data)
}

export function deletePropertyDraft(id) {
  return apiClient.delete(`/property-drafts/${id}`)
}

export function uploadPropertyDraftMedia(draftId, formData) {
  return uploadClient.post(`/property-drafts/${draftId}/media`, formData)
}

export function deletePropertyDraftMedia(draftId, mediaId) {
  return apiClient.delete(`/property-drafts/${draftId}/media/${mediaId}`)
}

export function setPropertyDraftThumbnail(draftId, mediaId) {
  return apiClient.patch(`/property-drafts/${draftId}/media/${mediaId}/thumbnail`)
}

export function publishCreateDraft(draftId) {
  return apiClient.post(`/property-drafts/${draftId}/publish`)
}

export function applyEditDraft(draftId) {
  return apiClient.post(`/property-drafts/${draftId}/apply-edit`)
}

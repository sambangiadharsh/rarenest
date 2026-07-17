import apiClient from '@/shared/lib/apiClient'
import uploadClient from '@/shared/lib/uploadClient'

export function getConversations(params = {}) {
  return apiClient.get('/conversations', { params })
}

export function getConversation(id) {
  return apiClient.get(`/conversations/${id}`)
}

export function getMessages(conversationId, params = {}) {
  return apiClient.get(`/conversations/${conversationId}/messages`, { params })
}

export function sendMessage(conversationId, body) {
  return apiClient.post(`/conversations/${conversationId}/messages`, body)
}

export function uploadAttachment(conversationId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return uploadClient.post(`/conversations/${conversationId}/attachments`, formData)
}

export function markRead(conversationId, messageId) {
  return apiClient.patch(`/conversations/${conversationId}/read`, { message_id: messageId })
}

export function archiveConversation(conversationId, isArchived) {
  return apiClient.patch(`/conversations/${conversationId}/archive`, { is_archived: isArchived })
}

export function openPropertyChat(propertyId) {
  return apiClient.post('/property-chat/open', { property_id: propertyId })
}

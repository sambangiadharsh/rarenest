import apiClient from '@/shared/lib/apiClient'

export function getNotifications(params = {}) {
  return apiClient.get('/notifications', { params })
}

export function getUnreadCount() {
  return apiClient.get('/notifications/unread-count')
}

export function markNotificationRead(id) {
  return apiClient.patch(`/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return apiClient.patch('/notifications/read-all')
}

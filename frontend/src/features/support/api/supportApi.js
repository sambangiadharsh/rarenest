import apiClient from '@/shared/lib/apiClient'

export const SUPPORT_CATEGORIES = [
  'Account',
  'Property Listing',
  'Builder Verification',
  'Report Listing',
  'Technical Issue',
  'Payments',
  'Feature Request',
  'Other',
]

export function createTicket(body) {
  return apiClient.post('/support/tickets', body)
}

export function getMyTickets(params = {}) {
  return apiClient.get('/support/tickets', { params })
}

export function getTicket(id) {
  return apiClient.get(`/support/tickets/${id}`)
}

export function getTicketMessages(ticketId, params = {}) {
  return apiClient.get(`/support/tickets/${ticketId}/messages`, { params })
}

export function sendTicketMessage(ticketId, message) {
  return apiClient.post(`/support/tickets/${ticketId}/messages`, { message })
}

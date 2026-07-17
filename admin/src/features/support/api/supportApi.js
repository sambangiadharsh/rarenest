import apiClient from '@/shared/lib/apiClient'

export function getTickets(params = {}) {
  return apiClient.get('/admin/support/tickets', { params })
}

export function getTicket(id) {
  return apiClient.get(`/admin/support/tickets/${id}`)
}

export function getTicketMessages(ticketId, params = {}) {
  return apiClient.get(`/admin/support/tickets/${ticketId}/messages`, { params })
}

export function assignTicket(ticketId, adminId) {
  return apiClient.patch(`/admin/support/tickets/${ticketId}/assign`, { admin_id: adminId })
}

export function updateTicketStatus(ticketId, status) {
  return apiClient.patch(`/admin/support/tickets/${ticketId}/status`, { status })
}

export function updateTicketPriority(ticketId, priority) {
  return apiClient.patch(`/admin/support/tickets/${ticketId}/priority`, { priority })
}

export function addInternalNote(ticketId, message) {
  return apiClient.post(`/admin/support/tickets/${ticketId}/internal-notes`, { message })
}

export function sendTicketMessage(ticketId, message) {
  return apiClient.post(`/admin/support/tickets/${ticketId}/messages`, { message })
}

export function getAdmins() {
  return apiClient.get('/admin/support/admins')
}

export const TICKET_STATUSES = [
  'Open',
  'In Progress',
  'Waiting for User',
  'Resolved',
  'Closed',
]

export const TICKET_PRIORITIES = ['Low', 'Medium', 'High']

export const TICKET_CATEGORIES = [
  'Account',
  'Property Listing',
  'Builder Verification',
  'Report Listing',
  'Technical Issue',
  'Payments',
  'Feature Request',
  'Other',
]

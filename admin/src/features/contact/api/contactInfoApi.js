import apiClient from '@/shared/lib/apiClient'

export function getContactInfo() {
  return apiClient.get('/contact-info')
}

export function updateContactInfo(data) {
  return apiClient.put('/contact-info', data)
}

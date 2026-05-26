import apiClient from '@/shared/lib/apiClient'

export function getContactInfo() {
  return apiClient.get('/contact-info')
}

import apiClient from '@/shared/lib/apiClient'

export function getFaqsAdmin() {
  return apiClient.get('/faqs/admin')
}

export function createFaq(data) {
  return apiClient.post('/faqs', data)
}

export function updateFaq(id, data) {
  return apiClient.put(`/faqs/${id}`, data)
}

export function deleteFaq(id) {
  return apiClient.delete(`/faqs/${id}`)
}

import apiClient from '@/shared/lib/apiClient'

export function getCareersAdmin() {
  return apiClient.get('/careers/admin')
}

export function createCareer(data) {
  return apiClient.post('/careers', data)
}

export function updateCareer(id, data) {
  return apiClient.put(`/careers/${id}`, data)
}

export function deleteCareer(id) {
  return apiClient.delete(`/careers/${id}`)
}

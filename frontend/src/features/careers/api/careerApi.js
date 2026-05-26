import apiClient from '@/shared/lib/apiClient'

export function getCareers() {
  return apiClient.get('/careers')
}

export function getCareer(id) {
  return apiClient.get(`/careers/${id}`)
}

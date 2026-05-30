import apiClient from '@/shared/lib/apiClient'

export function getProfile() {
  return apiClient.get('/users/profile')
}

export function updateProfile(payload) {
  return apiClient.put('/users/profile', payload)
}

import apiClient from '@/shared/lib/apiClient'

export function getProfile() {
  return apiClient.get('/users/profile')
}

export function updateProfile(payload) {
  return apiClient.put('/users/profile', payload)
}

export function updateRole(payload) {
  return apiClient.patch('/users/role', payload)
}

export function changePassword(payload) {
  return apiClient.put('/auth/changepassword', payload)
}

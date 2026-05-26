import apiClient from '@/shared/lib/apiClient'

export function login(credentials) {
  return apiClient.post('/auth/login', credentials)
}

export function logout() {
  return apiClient.get('/auth/logout')
}

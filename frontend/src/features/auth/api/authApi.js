import apiClient from '@/shared/lib/apiClient'

export function login(credentials) {
  return apiClient.post('/auth/login', credentials)
}

export function register(userData) {
  return apiClient.post('/auth/register', userData)
}

export function logout() {
  return apiClient.get('/auth/logout')
}

export function forgotPassword(payload) {
  return apiClient.post('/auth/forgot-password', payload)
}

export function resetPassword(payload) {
  return apiClient.post('/auth/reset-password', payload)
}

export function googleLogin(token) {
  return apiClient.post('/auth/google', { token })
}

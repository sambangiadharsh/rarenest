import { useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function useLogin() {
  return useMutation({
    mutationFn: (credentials) => apiClient.post('/auth/login', credentials),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => apiClient.get('/auth/logout'),
  })
}

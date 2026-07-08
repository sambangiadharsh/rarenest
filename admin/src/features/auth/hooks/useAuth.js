import { useMutation } from '@tanstack/react-query'
import * as authService from '../services/authService'

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
  })
}

export function useGoogleLogin() {
  return useMutation({
    mutationFn: (token) => authService.googleLogin(token),
  })
}

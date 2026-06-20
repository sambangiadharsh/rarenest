import { useMutation } from '@tanstack/react-query'
import * as authService from '../services/authService'

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authService.resetPassword,
  })
}

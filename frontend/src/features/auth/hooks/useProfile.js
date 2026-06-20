import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as profileApi from '../api/profileApi'

export function useProfile(options = {}) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    ...options,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useUpdateRole() {
  return useMutation({
    mutationFn: profileApi.updateRole,
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: profileApi.changePassword,
  })
}

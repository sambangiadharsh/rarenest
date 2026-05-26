import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export const careersQueryKey = ['careers', 'admin']

export function useCareersAdmin() {
  return useQuery({
    queryKey: careersQueryKey,
    queryFn: () => apiClient.get('/careers/admin'),
  })
}

export function useCreateCareer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => apiClient.post('/careers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careersQueryKey })
    },
  })
}

export function useUpdateCareer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.put(`/careers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careersQueryKey })
    },
  })
}

export function useDeleteCareer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => apiClient.delete(`/careers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careersQueryKey })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function useProperties(params = {}, options = {}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => apiClient.get('/properties', { params }),
    ...options,
  })
}

export function useVerifyProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_verified }) =>
      apiClient.put(`/properties/${id}/verify`, { is_verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

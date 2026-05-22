import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function useSellerProfile(id, options = {}) {
  return useQuery({
    queryKey: ['seller', id],
    queryFn: () => apiClient.get(`/sellers/${id}`),
    enabled: !!id,
    ...options,
  })
}

export function useUpdateSellerProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (profileData) => apiClient.post('/sellers/profile', profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller'] })
    },
  })
}

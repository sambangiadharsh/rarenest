import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (propertyId) => apiClient.post(`/wishlist/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

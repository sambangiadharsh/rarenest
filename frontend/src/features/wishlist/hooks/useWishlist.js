import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToWishlist } from '../services/wishlistService'

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

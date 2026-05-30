import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addToWishlist,
  getWishlist,
  getWishlistIds,
  removeFromWishlist,
} from '../services/wishlistService'

function invalidateWishlist(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['wishlist'] })
}

export function useWishlist(options = {}) {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
    ...options,
  })
}

export function useWishlistIds(options = {}) {
  return useQuery({
    queryKey: ['wishlist', 'ids'],
    queryFn: getWishlistIds,
    ...options,
  })
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => invalidateWishlist(queryClient),
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => invalidateWishlist(queryClient),
  })
}

export function useToggleWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ propertyId, isWishlisted }) => {
      if (isWishlisted) {
        return removeFromWishlist(propertyId)
      }
      return addToWishlist(propertyId)
    },
    onSuccess: () => invalidateWishlist(queryClient),
  })
}

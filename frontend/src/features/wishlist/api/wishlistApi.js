import apiClient from '@/shared/lib/apiClient'

export function addToWishlist(propertyId) {
  return apiClient.post(`/wishlist/${propertyId}`)
}

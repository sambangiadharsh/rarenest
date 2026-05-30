import apiClient from '@/shared/lib/apiClient'

export function getWishlist() {
  return apiClient.get('/wishlist')
}

export function getWishlistIds() {
  return apiClient.get('/wishlist/ids')
}

export function addToWishlist(propertyId) {
  return apiClient.post(`/wishlist/${propertyId}`)
}

export function removeFromWishlist(propertyId) {
  return apiClient.delete(`/wishlist/${propertyId}`)
}

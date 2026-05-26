import apiClient from '@/shared/lib/apiClient'

export function getSeller(id) {
  return apiClient.get(`/sellers/${id}`)
}

export function updateSellerProfile(profileData) {
  return apiClient.post('/sellers/profile', profileData)
}

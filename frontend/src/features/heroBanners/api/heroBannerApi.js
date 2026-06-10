import apiClient from '@/shared/lib/apiClient'

export function getActiveBanners() {
  return apiClient.get('/hero-banners')
}

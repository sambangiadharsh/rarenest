import { useQuery } from '@tanstack/react-query'
import { getActiveBanners } from '../api/heroBannerApi'

export function useActiveBanners() {
  return useQuery({
    queryKey: ['hero-banners', 'active'],
    queryFn: getActiveBanners,
    staleTime: 1000 * 60 * 5,
  })
}

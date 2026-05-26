import { useQuery } from '@tanstack/react-query'
import { getCmsPage } from '../services/cmsService'

export function cmsPageKey(pageKey) {
  return ['cms', pageKey]
}

export function useCmsPage(pageKey) {
  return useQuery({
    queryKey: cmsPageKey(pageKey),
    queryFn: () => getCmsPage(pageKey),
    retry: false,
  })
}

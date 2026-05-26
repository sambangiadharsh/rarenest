import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function cmsPageKey(pageKey) {
  return ['cms', pageKey]
}

export function useCmsPage(pageKey) {
  return useQuery({
    queryKey: cmsPageKey(pageKey),
    queryFn: () => apiClient.get(`/cms/pages/${pageKey}`),
    retry: false,
  })
}

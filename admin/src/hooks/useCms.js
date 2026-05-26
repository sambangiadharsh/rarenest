import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function cmsPageKey(pageKey) {
  return ['cms', pageKey]
}

export function useCmsPageAdmin(pageKey) {
  return useQuery({
    queryKey: cmsPageKey(pageKey),
    queryFn: () => apiClient.get(`/cms/pages/${pageKey}/admin`),
  })
}

export function useUpdateCmsPage(pageKey) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => apiClient.put(`/cms/pages/${pageKey}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsPageKey(pageKey) })
    },
  })
}

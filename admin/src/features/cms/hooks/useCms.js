import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as cmsService from '../services/cmsService'

export function cmsPageKey(pageKey) {
  return ['cms', pageKey]
}

export function useCmsPageAdmin(pageKey) {
  return useQuery({
    queryKey: cmsPageKey(pageKey),
    queryFn: () => cmsService.getCmsPageAdmin(pageKey),
  })
}

export function useUpdateCmsPage(pageKey) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => cmsService.updateCmsPage(pageKey, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsPageKey(pageKey) })
    },
  })
}

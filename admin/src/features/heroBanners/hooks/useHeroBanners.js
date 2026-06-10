import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as heroBannerService from '../services/heroBannerService'

export const heroBannersQueryKey = ['hero-banners', 'admin']

export function useHeroBannersAdmin() {
  return useQuery({
    queryKey: heroBannersQueryKey,
    queryFn: heroBannerService.getHeroBannersAdmin,
  })
}

export function useCreateHeroBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    // payload = { file?, title, subtitle, is_active, display_order }
    mutationFn: heroBannerService.createHeroBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: heroBannersQueryKey }),
  })
}

export function useUpdateHeroBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    // payload = { id, file?, title, subtitle, is_active, ... }
    mutationFn: ({ id, ...rest }) => heroBannerService.updateHeroBanner(id, rest),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: heroBannersQueryKey }),
  })
}

export function useDeleteHeroBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: heroBannerService.deleteHeroBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: heroBannersQueryKey }),
  })
}

export function useToggleHeroBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: heroBannerService.toggleHeroBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: heroBannersQueryKey }),
  })
}

export function useReorderHeroBanners() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: heroBannerService.reorderHeroBanners,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: heroBannersQueryKey }),
  })
}

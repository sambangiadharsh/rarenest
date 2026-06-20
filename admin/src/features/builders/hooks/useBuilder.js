import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as builderService from '../services/builderService'

export function useBuilderApplications(options = {}) {
  return useQuery({
    queryKey: ['builder-applications'],
    queryFn: builderService.getAllApplications,
    ...options,
  })
}

export function useReviewBuilderApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => builderService.reviewApplication(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-applications'] })
      queryClient.invalidateQueries({ queryKey: ['builders'] })
    },
  })
}

export function useBuilders(options = {}) {
  return useQuery({
    queryKey: ['builders'],
    queryFn: builderService.getAllBuilders,
    ...options,
  })
}

export function useToggleBuilderFeatured() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (builderId) => builderService.toggleBuilderFeatured(builderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builders'] })
    },
  })
}

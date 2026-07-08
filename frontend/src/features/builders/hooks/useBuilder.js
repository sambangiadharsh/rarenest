import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as builderApi from '../api/builderApi'

export function useBuilders(options = {}) {
  return useQuery({
    queryKey: ['builders'],
    queryFn: builderApi.getAllBuilders,
    ...options,
  })
}

export function useBuilderProfile(builderId, options = {}) {
  return useQuery({
    queryKey: ['builder', builderId],
    queryFn: () => builderApi.getBuilderProfile(builderId),
    enabled: !!builderId,
    ...options,
  })
}

export function useBuilderByUser(userId, options = {}) {
  return useQuery({
    queryKey: ['builder-by-user', userId],
    queryFn: () => builderApi.getBuilderByUser(userId),
    enabled: !!userId,
    ...options,
  })
}

export function useBuilderReviews(builderId, options = {}) {
  return useQuery({
    queryKey: ['builder-reviews', builderId],
    queryFn: () => builderApi.getBuilderReviews(builderId),
    enabled: !!builderId,
    ...options,
  })
}

export function useSubmitBuilderReview(builderId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => builderApi.submitBuilderReview(builderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-reviews', builderId] })
      queryClient.invalidateQueries({ queryKey: ['builder', builderId] })
    },
  })
}

export function useMyBuilderApplication(options = {}) {
  return useQuery({
    queryKey: ['my-builder-application'],
    queryFn: builderApi.getMyBuilderApplication,
    ...options,
  })
}

export function useSubmitBuilderApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ formData, onUploadProgress }) =>
      builderApi.submitBuilderApplication(formData, { onUploadProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-builder-application'] })
    },
  })
}

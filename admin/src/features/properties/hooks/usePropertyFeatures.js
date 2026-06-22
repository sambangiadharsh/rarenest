import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as propertyFeatureApi from '../api/propertyFeatureApi'

export const categoriesQueryKey = ['property-feature-categories']
export const featuresQueryKey = ['property-features']

export function useCategories(params) {
  return useQuery({
    queryKey: [...categoriesQueryKey, params],
    queryFn: () => propertyFeatureApi.getCategories(params),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: propertyFeatureApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => propertyFeatureApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
      queryClient.invalidateQueries({ queryKey: featuresQueryKey })
    },
  })
}

export function useFeatures(params) {
  return useQuery({
    queryKey: [...featuresQueryKey, params],
    queryFn: () => propertyFeatureApi.getFeatures(params),
  })
}

export function useCreateFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: propertyFeatureApi.createFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featuresQueryKey })
    },
  })
}

export function useUpdateFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => propertyFeatureApi.updateFeature(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featuresQueryKey })
    },
  })
}

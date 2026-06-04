import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as propertyService from '../services/propertyService'

export function useProperties(params = {}, options = {}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertyService.getProperties(params),
    ...options,
  })
}

export function useVerifyProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_verified }) =>
      propertyService.verifyProperty(id, is_verified),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['property', variables.id] })
      }
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => propertyService.updateProperty(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['property', variables.id] })
      }
    },
  })
}

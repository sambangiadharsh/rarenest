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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export const propertyTypesQueryKey = ['property-types']

export function usePropertyTypes() {
  return useQuery({
    queryKey: propertyTypesQueryKey,
    queryFn: () => apiClient.get('/property-types'),
  })
}

export function useCreatePropertyType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => apiClient.post('/property-types', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyTypesQueryKey })
    },
  })
}

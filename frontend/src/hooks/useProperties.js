import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import uploadClient from '@/lib/uploadClient'

export function useProperties(params = {}, options = {}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => apiClient.get('/properties', { params }),
    ...options,
  })
}

export function useProperty(id, options = {}) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => apiClient.get(`/properties/${id}`),
    enabled: !!id,
    ...options,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newProperty) => apiClient.post('/properties', newProperty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updatedData }) =>
      apiClient.put(`/properties/${id}`, updatedData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', id] })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function useUploadPropertyMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ propertyId, formData }) =>
      uploadClient.post(`/properties/${propertyId}/media`, formData),
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] })
    },
  })
}

export function useVerifyProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_verified }) =>
      apiClient.put(`/properties/${id}/verify`, { is_verified }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', id] })
    },
  })
}

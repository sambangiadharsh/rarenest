import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as propertyService from '../services/propertyService'

export function useProperties(params = {}, options = {}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertyService.getProperties(params),
    ...options,
  })
}

export function useProperty(id, options = {}) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id),
    enabled: !!id,
    ...options,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: propertyService.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function useGuestCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: propertyService.guestCreateProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function useGuestCreateSellerAccount() {
  return useMutation({
    mutationFn: propertyService.guestCreateSellerAccount,
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updatedData }) =>
      propertyService.updateProperty(id, updatedData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', id] })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: propertyService.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function useUploadPropertyMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ propertyId, formData }) =>
      propertyService.uploadPropertyMedia(propertyId, formData),
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
      propertyService.verifyProperty(id, is_verified),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', id] })
    },
  })
}

export function usePropertyVerificationHistory(id, options = {}) {
  return useQuery({
    queryKey: ['property-verification-history', id],
    queryFn: () => propertyService.getPropertyVerificationHistory(id),
    enabled: !!id,
    ...options,
  })
}

export function useResubmitProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => propertyService.resubmitProperty(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['property', id] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property-verification-history', id] })
    },
  })
}

export function usePropertyEnquiries(id, options = {}) {
  return useQuery({
    queryKey: ['property-enquiries', id],
    queryFn: () => propertyService.getPropertyEnquiries(id),
    enabled: !!id,
    ...options,
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as propertyTypeService from '../services/propertyTypeService'

export const propertyTypesQueryKey = ['property-types']

export function usePropertyTypes() {
  return useQuery({
    queryKey: propertyTypesQueryKey,
    queryFn: propertyTypeService.getPropertyTypes,
  })
}

export function useCreatePropertyType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: propertyTypeService.createPropertyType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyTypesQueryKey })
    },
  })
}

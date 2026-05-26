import { useQuery } from '@tanstack/react-query'
import { getActivePropertyTypes } from '../services/propertyTypeService'

export function usePropertyTypes() {
  return useQuery({
    queryKey: ['property-types', 'active'],
    queryFn: getActivePropertyTypes,
  })
}

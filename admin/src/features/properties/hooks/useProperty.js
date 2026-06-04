import { useQuery } from '@tanstack/react-query'
import * as propertyService from '../services/propertyService'

export function useProperty(id, options = {}) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id),
    enabled: Boolean(id),
    ...options,
  })
}

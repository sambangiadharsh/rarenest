import { useQuery } from '@tanstack/react-query'
import * as careerService from '../services/careerService'

export const careersQueryKey = ['careers']

export function useCareers() {
  return useQuery({
    queryKey: careersQueryKey,
    queryFn: careerService.getCareers,
  })
}

export function useCareer(id) {
  return useQuery({
    queryKey: ['careers', id],
    queryFn: () => careerService.getCareer(id),
    enabled: !!id,
    retry: false,
  })
}

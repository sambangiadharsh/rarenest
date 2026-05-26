import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as careerService from '../services/careerService'

export const careersQueryKey = ['careers', 'admin']

export function useCareersAdmin() {
  return useQuery({
    queryKey: careersQueryKey,
    queryFn: careerService.getCareersAdmin,
  })
}

export function useCreateCareer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: careerService.createCareer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careersQueryKey })
    },
  })
}

export function useUpdateCareer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => careerService.updateCareer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careersQueryKey })
    },
  })
}

export function useDeleteCareer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: careerService.deleteCareer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careersQueryKey })
    },
  })
}

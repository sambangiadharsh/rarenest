import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as contactInfoService from '../services/contactInfoService'

export const contactInfoQueryKey = ['contact-info']

export function useContactInfo() {
  return useQuery({
    queryKey: contactInfoQueryKey,
    queryFn: contactInfoService.getContactInfo,
  })
}

export function useUpdateContactInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: contactInfoService.updateContactInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactInfoQueryKey })
    },
  })
}

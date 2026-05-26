import { useQuery } from '@tanstack/react-query'
import { getContactInfo } from '../services/contactInfoService'

export const contactInfoQueryKey = ['contact-info']

export function useContactInfo() {
  return useQuery({
    queryKey: contactInfoQueryKey,
    queryFn: getContactInfo,
  })
}

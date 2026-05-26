import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export const faqsQueryKey = ['faqs']

export function useFaqs() {
  return useQuery({
    queryKey: faqsQueryKey,
    queryFn: () => apiClient.get('/faqs'),
  })
}

import { useQuery } from '@tanstack/react-query'
import { getFaqs } from '../services/faqService'

export const faqsQueryKey = ['faqs']

export function useFaqs() {
  return useQuery({
    queryKey: faqsQueryKey,
    queryFn: getFaqs,
  })
}

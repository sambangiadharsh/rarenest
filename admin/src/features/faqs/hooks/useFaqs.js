import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as faqService from '../services/faqService'

export const faqsQueryKey = ['faqs', 'admin']

export function useFaqsAdmin() {
  return useQuery({
    queryKey: faqsQueryKey,
    queryFn: faqService.getFaqsAdmin,
  })
}

export function useCreateFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: faqService.createFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqsQueryKey })
    },
  })
}

export function useUpdateFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => faqService.updateFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqsQueryKey })
    },
  })
}

export function useDeleteFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: faqService.deleteFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqsQueryKey })
    },
  })
}

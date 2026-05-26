import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export const faqsQueryKey = ['faqs', 'admin']

export function useFaqsAdmin() {
  return useQuery({
    queryKey: faqsQueryKey,
    queryFn: () => apiClient.get('/faqs/admin'),
  })
}

export function useCreateFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => apiClient.post('/faqs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqsQueryKey })
    },
  })
}

export function useUpdateFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.put(`/faqs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqsQueryKey })
    },
  })
}

export function useDeleteFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => apiClient.delete(`/faqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqsQueryKey })
    },
  })
}

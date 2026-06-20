import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as reviewApi from '../api/reviewApi'

export function usePendingReviews() {
  return useQuery({
    queryKey: ['admin-reviews', 'pending'],
    queryFn: reviewApi.getPendingReviews,
  })
}

export function useApprovedReviews() {
  return useQuery({
    queryKey: ['admin-reviews', 'approved'],
    queryFn: reviewApi.getApprovedReviews,
  })
}

export function useRejectedReviews() {
  return useQuery({
    queryKey: ['admin-reviews', 'rejected'],
    queryFn: reviewApi.getRejectedReviews,
  })
}

export function useApproveReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId) => reviewApi.approveReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    },
  })
}

export function useRejectReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId) => reviewApi.rejectReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    },
  })
}

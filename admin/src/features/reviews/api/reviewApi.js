import apiClient from '@/shared/lib/apiClient'

export function getPendingReviews() {
  return apiClient.get('/admin/reviews/pending')
}

export function getApprovedReviews() {
  return apiClient.get('/admin/reviews/approved')
}

export function getRejectedReviews() {
  return apiClient.get('/admin/reviews/rejected')
}

export function approveReview(reviewId) {
  return apiClient.put(`/admin/reviews/${reviewId}/approve`)
}

export function rejectReview(reviewId) {
  return apiClient.put(`/admin/reviews/${reviewId}/reject`)
}

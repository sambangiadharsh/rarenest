import apiClient from '@/shared/lib/apiClient'

export function getDashboardStats() {
  return apiClient.get('/dashboard/stats')
}

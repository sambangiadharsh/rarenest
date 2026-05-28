import { useQuery } from '@tanstack/react-query'
import * as dashboardService from '../services/dashboardService'

export const dashboardStatsQueryKey = ['dashboard-stats']

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardStatsQueryKey,
    queryFn: dashboardService.getDashboardStats,
  })
}

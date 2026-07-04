import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ActiveNowView } from '../types/database'

export interface OverviewData {
  active_employees: number
  open_projects: number
  total_minutes_today: number
  active_now: ActiveNowView[]
}

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: () => api.get<OverviewData>('/overview.php'),
    refetchInterval: 30_000,
  })
}
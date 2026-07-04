import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ActiveNowView } from '../types/database'

export function useActiveNow() {
  return useQuery({
    queryKey: ['active-now'],
    queryFn: () => api.get<ActiveNowView[]>('/shifts/active.php'),
    refetchInterval: 30_000,
  })
}
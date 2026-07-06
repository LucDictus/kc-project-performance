import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { EmployeeDetail } from './useEmployeeDetail'

export function useMyHours(employeeId: number | null, from: string, to: string) {
  return useQuery({
    queryKey: ['my-hours', employeeId, from, to],
    queryFn: () =>
      api.get<EmployeeDetail>(
        `/employees/detail.php?id=${employeeId}&month_from=${from}&month_to=${to}`
      ),
    enabled: !!employeeId,
  })
}
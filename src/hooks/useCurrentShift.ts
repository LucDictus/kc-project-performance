import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface CurrentShift {
  shift_id: number
  shift_started_at: string
  session_id: number | null
  project_id: number | null
  session_started_at: string | null
  project_number: string | null
  car_license_plate: string | null
  car_make_model: string | null
  customer_name: string | null
}

export function useCurrentShift(employeeId: number | null) {
  return useQuery({
    queryKey: ['current-shift', employeeId],
    queryFn: () => api.get<CurrentShift | null>(`/shifts/current.php?employee_id=${employeeId}`),
    enabled: !!employeeId,
    refetchInterval: 30_000,
  })
}
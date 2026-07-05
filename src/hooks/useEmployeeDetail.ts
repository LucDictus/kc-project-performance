import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Employee, Project } from '../types/database'

export interface DayRow {
  date: string
  first_clock_in: string
  last_clock_out: string
  total_minutes: number
  shift_count: number
}

export interface ProjectRow extends Project {
  total_minutes: number
  session_count: number
  first_session: string
}

export interface EmployeeDetail {
  employee: Employee
  days: DayRow[]
  projects: ProjectRow[]
  total_minutes: number
  period: { from: string; to: string }
}

export function useEmployeeDetail(id: number | null, from: string, to: string) {
  return useQuery({
    queryKey: ['employee-detail', id, from, to],
    queryFn: () =>
      api.get<EmployeeDetail>(
        `/employees/detail.php?id=${id}&month_from=${from}&month_to=${to}`
      ),
    enabled: !!id,
  })
}
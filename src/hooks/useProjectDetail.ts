import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Project } from '../types/database'

export interface SessionRow {
  session_id: number
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  description: string | null
  employee_id: number
  employee_name: string
  date: string
}

export interface EmployeeHours {
  employee_id: number
  employee_name: string
  session_count: number
  total_minutes: number
}

export interface ProjectDetail {
  project: Project
  sessions: SessionRow[]
  per_employee: EmployeeHours[]
  total_minutes: number
}

export function useProjectDetail(id: number | null) {
  return useQuery({
    queryKey: ['project-detail', id],
    queryFn: () => api.get<ProjectDetail>(`/projects/detail.php?id=${id}`),
    enabled: !!id,
  })
}
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Employee } from '../types/database'

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => api.get<Employee[]>('/employees/index.php'),
  })
}
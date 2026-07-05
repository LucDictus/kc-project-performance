import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Employee } from '../types/database'

interface UpdateEmployeeInput {
  id: number
  name?: string
  username?: string
  role?: 'mechanic' | 'admin'
  password?: string
  is_active?: boolean
}

export function useUpdateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) =>
      api.patch<Employee>('/employees/update.php', input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      qc.invalidateQueries({ queryKey: ['employee-detail', id] })
    },
  })
}
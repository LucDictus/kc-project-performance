import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Employee } from '../types/database'

interface CreateEmployeeInput {
  name: string
  username: string
  password: string
  role: 'mechanic' | 'admin'
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) =>
      api.post<Employee>('/employees/create.php', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}
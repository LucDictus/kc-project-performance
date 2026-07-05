import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Project } from '../types/database'

interface CreateProjectInput {
  car_license_plate: string
  car_make_model: string
  customer_name: string
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      api.post<Project>('/projects/create.php', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}
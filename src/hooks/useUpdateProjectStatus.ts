import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Project } from '../types/database'

export function useUpdateProjectStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Project['status'] }) =>
      api.patch<Project>('/projects/update.php', { id, status }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['project-detail', id] })
      qc.invalidateQueries({ queryKey: ['overview'] })
    },
  })
}
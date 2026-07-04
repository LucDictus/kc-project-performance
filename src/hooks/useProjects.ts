import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Project } from '../types/database'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/projects/index.php'),
  })
}
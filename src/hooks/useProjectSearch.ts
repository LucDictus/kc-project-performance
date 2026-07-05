import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Project } from '../types/database'

export function useProjectSearch(query: string) {
  return useQuery({
    queryKey: ['project-search', query],
    queryFn: () => api.get<Project[]>(`/projects/search.php?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 10_000,
  })
}
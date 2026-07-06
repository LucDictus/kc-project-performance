import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useStartShift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (employee_id: number) =>
      api.post('/shifts/index.php', { employee_id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['current-shift'] }),
  })
}

export function useStopShift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ shift_id, description }: { shift_id: number; description?: string }) =>
      api.patch('/shifts/stop.php', { shift_id, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['current-shift'] })
      qc.invalidateQueries({ queryKey: ['overview'] })
      qc.invalidateQueries({ queryKey: ['active-now'] })
    },
  })
}
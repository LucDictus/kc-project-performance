import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

async function fetchActiveNow() {
  const { data, error } = await supabase
    .from('v_active_now')
    .select('*')
    .order('shift_started_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function useActiveNow() {
  return useQuery({
    queryKey: ['active-now'],
    queryFn: fetchActiveNow,
    refetchInterval: 30_000, // replaces your setInterval
  })
}
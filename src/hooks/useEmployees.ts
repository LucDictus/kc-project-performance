import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

async function fetchEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
  })
}
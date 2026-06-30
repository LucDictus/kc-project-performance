import { useActiveNow } from '../../../hooks/useActiveNow'
import type { ActiveNowView } from '../../../types/database'

export default function ActiveTab() {
  const { data: rows = [], isLoading, error } = useActiveNow()

  if (isLoading) return <p style={{ color: 'var(--color-text-muted)' }}>Laden...</p>

  if (error) {
    return (
      <p style={{ color: 'var(--color-danger)' }}>
        Fout bij laden van actieve diensten
      </p>
    )
  }

  if (rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ fontWeight: 600 }}>Niemand aan het werk</p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Er zijn op dit moment geen actieve diensten.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        {rows.length} actief
      </p>

      {rows.map((row: ActiveNowView) => (
        <div key={row.shift_id} style={{ padding: '1rem', border: '1px solid var(--color-border)' }}>
          {row.employee_name}
        </div>
      ))}
    </div>
  )
}
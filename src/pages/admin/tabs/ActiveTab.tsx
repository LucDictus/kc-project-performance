import { useEffect, useState } from 'react'
import { useActiveNow } from '../../../hooks/useActiveNow'
import type { ActiveNowView } from '../../../types/database'

export default function ActiveTab() {
  const { data: rows = [], isLoading, error } = useActiveNow()

  if (isLoading) return <p style={mutedStyle}>Laden...</p>

  if (error) return <p style={{ color: 'var(--color-danger)' }}>Fout bij laden van actieve diensten</p>

  if (rows.length === 0) {
    return (
      <div style={emptyStyle}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>
          Niemand aan het werk
        </p>
        <p style={mutedStyle}>Er zijn op dit moment geen actieve diensten.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ ...mutedStyle, marginBottom: '0.25rem' }}>
        {rows.length} {rows.length === 1 ? 'medewerker' : 'medewerkers'} actief
      </p>

      {rows.map((row: ActiveNowView) => (
        <div key={row.shift_id} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={avatarStyle}>
              {row.employee_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{row.employee_name}</p>
              <p style={mutedStyle}>
                Ingeklokt om {formatTime(row.shift_started_at)}
                {' · '}
                <DurationTicker startedAt={row.shift_started_at} />
              </p>
            </div>
          </div>

          {row.car_license_plate ? (
            <div style={projectBadgeStyle}>
              <span style={licensePlateStyle}>{row.car_license_plate}</span>
              <span style={mutedStyle}>{row.car_make_model}</span>
              {row.project_number && (
                <span style={{ ...mutedStyle, marginLeft: 'auto' }}>{row.project_number}</span>
              )}
            </div>
          ) : (
            <div style={{ ...projectBadgeStyle, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Geen actief project
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function DurationTicker({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor((now - new Date(startedAt).getTime()) / 60_000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) return <>{hours}u {mins}m</>
  return <>{mins}m</>
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

const mutedStyle: React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: '0.8rem' }
const emptyStyle: React.CSSProperties = { textAlign: 'center', padding: '3rem 1rem' }
const cardStyle: React.CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1rem' }
const avatarStyle: React.CSSProperties = { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }
const projectBadgeStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '2px', padding: '0.5rem 0.75rem' }
const licensePlateStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-accent)', letterSpacing: '0.05em' }
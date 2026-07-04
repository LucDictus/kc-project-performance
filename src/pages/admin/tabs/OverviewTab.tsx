import { useOverview } from '../../../hooks/useOverview'
import type { ActiveNowView } from '../../../types/database'
import { useEffect, useState } from 'react'

export default function OverviewTab() {
  const { data, isLoading, error } = useOverview()

  if (isLoading) return <p style={mutedStyle}>Laden...</p>
  if (error)     return <p style={{ color: 'var(--color-danger)' }}>Fout bij laden van overzicht</p>
  if (!data)     return null

  const hours = Math.floor(data.total_minutes_today / 60)
  const mins  = data.total_minutes_today % 60

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Stat kaarten */}
      <div style={statsGridStyle}>
        <StatCard
          label="Actieve medewerkers"
          value={String(data.active_employees)}
          accent={data.active_employees > 0}
        />
        <StatCard
          label="Open projecten"
          value={String(data.open_projects)}
        />
        <StatCard
          label="Uren vandaag"
          value={hours > 0 ? `${hours}u ${mins}m` : `${mins}m`}
        />
      </div>

      {/* Actieve medewerkers */}
      <section>
        <h2 style={sectionTitleStyle}>Nu aan het werk</h2>

        {data.active_now.length === 0 ? (
          <p style={mutedStyle}>Niemand is momenteel ingeklokt.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {data.active_now.map((row: ActiveNowView) => (
              <ActiveCard key={row.shift_id} row={row} />
            ))}
          </div>
        )}
      </section>

      {/* Actieve projecten */}
      <section>
        <h2 style={sectionTitleStyle}>Projecten in uitvoering</h2>

        {data.active_now.filter(r => r.car_license_plate).length === 0 ? (
          <p style={mutedStyle}>Geen projecten momenteel in uitvoering.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {data.active_now
              .filter(r => r.car_license_plate)
              .map((row: ActiveNowView) => (
                <div key={row.session_id} style={projectCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={licensePlateStyle}>{row.car_license_plate}</span>
                      <span style={mutedStyle}>{row.car_make_model}</span>
                    </div>
                    {row.project_number && (
                      <span style={mutedStyle}>{row.project_number}</span>
                    )}
                  </div>
                  <p style={{ ...mutedStyle, marginTop: '0.375rem' }}>
                    Monteur: {row.employee_name}
                    {row.session_started_at && (
                      <> · bezig sinds {formatTime(row.session_started_at)}</>
                    )}
                  </p>
                </div>
              ))
            }
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={statCardStyle}>
      <p style={statLabelStyle}>{label}</p>
      <p style={{ ...statValueStyle, color: accent ? 'var(--color-accent)' : 'var(--color-text)' }}>
        {value}
      </p>
    </div>
  )
}

function ActiveCard({ row }: { row: ActiveNowView }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor((now - new Date(row.shift_started_at).getTime()) / 60_000)
  const hours   = Math.floor(minutes / 60)
  const mins    = minutes % 60
  const duration = hours > 0 ? `${hours}u ${mins}m` : `${mins}m`

  return (
    <div style={activeCardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={avatarStyle}>{row.employee_name.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{row.employee_name}</p>
          <p style={mutedStyle}>Ingeklokt om {formatTime(row.shift_started_at)} · {duration}</p>
        </div>
        {row.car_license_plate && (
          <span style={licensePlateStyle}>{row.car_license_plate}</span>
        )}
      </div>
    </div>
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

const mutedStyle: React.CSSProperties       = { color: 'var(--color-text-muted)', fontSize: '0.8rem' }
const sectionTitleStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }
const statsGridStyle: React.CSSProperties   = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }
const statCardStyle: React.CSSProperties    = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1rem 1.25rem' }
const statLabelStyle: React.CSSProperties   = { fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }
const statValueStyle: React.CSSProperties   = { fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, lineHeight: 1 }
const activeCardStyle: React.CSSProperties  = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.875rem 1rem' }
const projectCardStyle: React.CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.875rem 1rem' }
const avatarStyle: React.CSSProperties      = { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }
const licensePlateStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-accent)', letterSpacing: '0.05em' }
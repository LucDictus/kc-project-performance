import { useState } from 'react'
import type { Project, ProjectStatus } from '../../../types/database'
import { useProjects } from '../../../hooks/useProjects'

type StatusFilter = 'all' | ProjectStatus

export default function ProjectsTab() {
  const { data: projects = [] as Project[], isLoading, error } = useProjects()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered: Project[] = projects.filter((p: Project) => {
    const matchSearch =
      p.car_license_plate.toLowerCase().includes(search.toLowerCase()) ||
      p.project_number.toLowerCase().includes(search.toLowerCase()) ||
      p.car_make_model.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || p.status === statusFilter

    return matchSearch && matchStatus
  })

  if (isLoading) {
    return <p style={mutedStyle}>Laden...</p>
  }

  if (error) {
    return <p style={{ color: 'var(--color-danger)' }}>Fout bij laden van projecten</p>
  }

  return (
    <div>
      {/* Zoek + filters */}
      <div style={toolbarStyle}>
        <input
          type="search"
          placeholder="Zoeken op kenteken, nummer, merk of klant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={searchStyle}
        />

        <div style={filterRowStyle}>
          <FilterChip label="Alle" value="all" current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Open" value="open" current={statusFilter} set={setStatusFilter} />
          <FilterChip label="On hold" value="on_hold" current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Gesloten" value="closed" current={statusFilter} set={setStatusFilter} />
        </div>
      </div>

      {/* Resultaten */}
      {filtered.length === 0 ? (
        <p style={mutedStyle}>Geen projecten gevonden.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map(p => (
            <div key={p.id} style={cardStyle}>
              <div style={cardTopStyle}>
                <div>
                  <span style={licensePlateStyle}>{p.car_license_plate}</span>
                  <span style={projectNumberStyle}>{p.project_number}</span>
                </div>

                <StatusBadge status={p.status} />
              </div>

              <p style={makeModelStyle}>{p.car_make_model}</p>
              <p style={mutedStyle}>{p.customer_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* status badge */
function StatusBadge({ status }: { status: ProjectStatus }) {
  const map = {
    open: { label: 'Open', color: 'var(--color-success)', bg: 'rgba(22,163,74,0.1)' },
    on_hold: { label: 'On hold', color: 'var(--color-text-muted)', bg: 'rgba(0,0,0,0.06)' },
    closed: { label: 'Gesloten', color: 'var(--color-accent)', bg: 'rgba(184,39,45,0.1)' },
  }

  const s = map[status]

  return (
    <span style={{
      padding: '0.2rem 0.6rem',
      borderRadius: '2px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  )
}

/* FilterChip (same pattern) */
function FilterChip<T extends string>({
  label, value, current, set
}: {
  label: string
  value: T
  current: T
  set: (v: T) => void
}) {
  const active = current === value

  return (
    <button
      onClick={() => set(value)}
      style={{
        padding: '0.3rem 0.75rem',
        borderRadius: '999px',
        border: '1px solid',
        borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
        background: active ? 'var(--color-accent)' : 'transparent',
        color: active ? '#fff' : 'var(--color-text-muted)',
        fontSize: '0.78rem',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

/* styles */
const mutedStyle:  React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: '0.8rem' }
const toolbarStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }
const filterRowStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }
const searchStyle: React.CSSProperties = { width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)' }
const cardStyle: React.CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '0.875rem 1rem' }
const cardTopStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between' }
const licensePlateStyle: React.CSSProperties = { fontWeight: 700, color: 'var(--color-accent)', marginRight: '0.5rem' }
const projectNumberStyle: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--color-text-muted)' }
const makeModelStyle: React.CSSProperties = { fontWeight: 500 }
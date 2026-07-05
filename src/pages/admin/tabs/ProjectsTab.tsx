import { useState } from 'react'
import type { Project, ProjectStatus } from '../../../types/database'
import { useProjects } from '../../../hooks/useProjects'
import { useNavigate } from 'react-router-dom'

type StatusFilter = 'all' | ProjectStatus

export default function ProjectsTab() {
  const navigate = useNavigate()
  const { data: projects = [], isLoading, error } = useProjects()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = projects.filter((p: Project) => {
    const matchSearch =
      p.car_license_plate.toLowerCase().includes(search.toLowerCase()) ||
      p.project_number.toLowerCase().includes(search.toLowerCase()) ||
      p.car_make_model.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  if (isLoading) return <p style={mutedStyle}>Laden...</p>
  if (error) return <p style={{ color: 'var(--color-danger)' }}>Fout bij laden van projecten</p>

  return (
    <div>
      <div style={toolbarStyle}>
        <input
          type="search"
          placeholder="Zoeken op kenteken, nummer, merk of klant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={searchStyle}
        />
        <div style={filterRowStyle}>
          <FilterChip label="Alle"     value="all"     current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Open"     value="open"    current={statusFilter} set={setStatusFilter} />
          <FilterChip label="On hold"  value="on_hold" current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Gesloten" value="closed"  current={statusFilter} set={setStatusFilter} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={mutedStyle}>Geen projecten gevonden.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map((p: Project) => (
            <div 
              key={p.id} style={cardStyle}
              onClick={() => navigate(`/admin/projects/${p.id}`)}
            >
              <div style={cardTopStyle}>
                <div>
                  <span style={licensePlateStyle}>{p.car_license_plate}</span>
                  <span style={projectNumberStyle}>{p.project_number}</span>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <p style={{ fontWeight: 500, fontSize: '0.875rem', margin: '0.375rem 0 0.2rem' }}>{p.car_make_model}</p>
              <p style={mutedStyle}>{p.customer_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
    open:    { label: 'Open',     color: 'var(--color-success)',    bg: 'rgba(22,163,74,0.1)' },
    on_hold: { label: 'On hold',  color: 'var(--color-text-muted)', bg: 'rgba(255,255,255,0.06)' },
    closed:  { label: 'Gesloten', color: 'var(--color-accent)',     bg: 'rgba(184,39,45,0.1)' },
  }
  const s = map[status]
  return (
    <span style={{
      padding: '0.2rem 0.6rem',
      borderRadius: '2px',
      fontSize: '0.75rem',
      fontWeight: 600,
      fontFamily: 'var(--font-display)',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      background: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  )
}

function FilterChip<T extends string>({ label, value, current, set }: { label: string; value: T; current: T; set: (v: T) => void }) {
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
        fontFamily: 'var(--font-body)',
        fontSize: '0.78rem',
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

const mutedStyle: React.CSSProperties     = { color: 'var(--color-text-muted)', fontSize: '0.8rem' }
const toolbarStyle: React.CSSProperties   = { display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }
const filterRowStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }
const searchStyle: React.CSSProperties    = { width: '100%', padding: '0.625rem 0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }
const cardStyle: React.CSSProperties      = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.875rem 1rem', cursor: 'pointer', transition: 'all 0.1s ease-in-out', userSelect: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
const cardTopStyle: React.CSSProperties   = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const licensePlateStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-accent)', letterSpacing: '0.05em', marginRight: '0.625rem' }
const projectNumberStyle: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--color-text-muted)' }
import { useState } from 'react'
import type { Employee } from '../../../types/database'
import { useEmployees } from '../../../hooks/useEmployees'

type RoleFilter = 'all' | 'mechanic' | 'admin'

export default function EmployeesTab() {
  const { data: employees = [] as Employee[], isLoading, error } = useEmployees()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')

  const filtered = employees.filter((e: Employee) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase())

    const matchRole = roleFilter === 'all' || e.role === roleFilter

    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? e.is_active
        : !e.is_active

    return matchSearch && matchRole && matchStatus
  })

  if (isLoading) {
    return <p style={mutedStyle}>Laden...</p>
  }

  if (error) {
    return <p style={{ color: 'var(--color-danger)' }}>Fout bij laden van medewerkers</p>
  }

  return (
    <div>
      {/* Zoek + filters */}
      <div style={toolbarStyle}>
        <input
          type="search"
          placeholder="Zoeken op naam of gebruikersnaam..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={searchStyle}
        />

        <div style={filterRowStyle}>
          <FilterChip label="Alle rollen" value="all" current={roleFilter} set={setRoleFilter} />
          <FilterChip label="Monteur" value="mechanic" current={roleFilter} set={setRoleFilter} />
          <FilterChip label="Beheerder" value="admin" current={roleFilter} set={setRoleFilter} />

          <div style={{ flex: 1 }} />

          <FilterChip label="Actief" value="active" current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Inactief" value="inactive" current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Allen" value="all" current={statusFilter} set={setStatusFilter} />
        </div>
      </div>

      {/* Resultaten */}
      {filtered.length === 0 ? (
        <p style={mutedStyle}>Geen medewerkers gevonden.</p>
      ) : (
        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <Th>Naam</Th>
                <Th>Gebruikersnaam</Th>
                <Th>Rol</Th>
                <Th>Status</Th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(e => (
                <tr key={e.id} style={trStyle}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={avatarStyle}>{e.name.charAt(0).toUpperCase()}</div>
                      {e.name}
                    </div>
                  </td>

                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>
                    {e.username}
                  </td>

                  <td style={tdStyle}>
                    <span style={roleBadgeStyle(e.role)}>
                      {e.role === 'admin' ? 'Beheerder' : 'Monteur'}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <span style={statusDotStyle(e.is_active)}>
                      {e.is_active ? 'Actief' : 'Inactief'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* UI helpers (unchanged) */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '0.625rem 1rem',
      textAlign: 'left',
      fontFamily: 'var(--font-display)',
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--color-text-muted)',
      borderBottom: '1px solid var(--color-border)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  )
}

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
        fontFamily: 'var(--font-body)',
        fontSize: '0.78rem',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

/* styles unchanged */
const mutedStyle: React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: '0.85rem' }
const toolbarStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }
const filterRowStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }
const searchStyle: React.CSSProperties = { width: '100%', padding: '0.625rem 0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text)' }
const tableWrapStyle: React.CSSProperties = { overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '4px' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const trStyle: React.CSSProperties = { borderBottom: '1px solid var(--color-border)' }
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem' }
const avatarStyle: React.CSSProperties = { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }

function roleBadgeStyle(role: string) {
  return {
    padding: '0.2rem 0.6rem',
    borderRadius: '2px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: role === 'admin' ? 'rgba(184,39,45,0.1)' : 'rgba(0,0,0,0.06)',
    color: role === 'admin' ? 'var(--color-accent)' : 'var(--color-text-muted)',
  }
}

function statusDotStyle(active: boolean) {
  return {
    fontSize: '0.8rem',
    color: active ? 'var(--color-success)' : 'var(--color-text-muted)',
  }
}
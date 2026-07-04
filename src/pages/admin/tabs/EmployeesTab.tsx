import { useState } from 'react'
import type { Employee } from '../../../types/database'
import { useEmployees } from '../../../hooks/useEmployees'
import { useCreateEmployee } from '../../../hooks/useCreateEmployee'

type RoleFilter = 'all' | 'mechanic' | 'admin'

export default function EmployeesTab() {
  const { data: employees = [], isLoading, error } = useEmployees()
  const createEmployee = useCreateEmployee()

  const [search, setSearch]           = useState('')
  const [roleFilter, setRoleFilter]   = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [modalOpen, setModalOpen]     = useState(false)

  const filtered = employees.filter((e: Employee) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter === 'all' || e.role === roleFilter
    const matchStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? Boolean(e.is_active) : !e.is_active
    return matchSearch && matchRole && matchStatus
  })

  if (isLoading) return <p style={mutedStyle}>Laden...</p>
  if (error)     return <p style={{ color: 'var(--color-danger)' }}>Fout bij laden van medewerkers</p>

  return (
    <>
      <div>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <input
            type="search"
            placeholder="Zoeken op naam of gebruikersnaam..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...searchStyle, flex: 1 }}
          />
          <button onClick={() => setModalOpen(true)} style={addButtonStyle}>
            + Nieuw
          </button>
        </div>

        <div style={filterRowStyle}>
          <FilterChip label="Alle rollen" value="all"      current={roleFilter}   set={setRoleFilter} />
          <FilterChip label="Monteur"     value="mechanic" current={roleFilter}   set={setRoleFilter} />
          <FilterChip label="Beheerder"   value="admin"    current={roleFilter}   set={setRoleFilter} />
          <div style={{ flex: 1 }} />
          <FilterChip label="Actief"   value="active"   current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Inactief" value="inactive" current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Allen"    value="all"      current={statusFilter} set={setStatusFilter} />
        </div>

        {/* Tabel */}
        <div style={{ marginTop: '1rem' }}>
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
                  {filtered.map((e: Employee) => (
                    <tr key={e.id} style={trStyle}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={avatarStyle}>{e.name.charAt(0).toUpperCase()}</div>
                          {e.name}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{e.username}</td>
                      <td style={tdStyle}>
                        <span style={roleBadgeStyle(e.role)}>
                          {e.role === 'admin' ? 'Beheerder' : 'Monteur'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.8rem', color: e.is_active ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
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
      </div>

      {/* Modal */}
      {modalOpen && (
        <CreateEmployeeModal
          onClose={() => setModalOpen(false)}
          onCreate={async (input) => {
            await createEmployee.mutateAsync(input)
            setModalOpen(false)
          }}
          loading={createEmployee.isPending}
          error={createEmployee.error?.message ?? null}
        />
      )}
    </>
  )
}

interface ModalProps {
  onClose: () => void
  onCreate: (input: { name: string; username: string; password: string; role: 'mechanic' | 'admin' }) => Promise<void>
  loading: boolean
  error: string | null
}

function CreateEmployeeModal({ onClose, onCreate, loading, error }: ModalProps) {
  const [name, setName]         = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<'mechanic' | 'admin'>('mechanic')

  async function handleSubmit() {
    if (!name || !username || !password) return
    await onCreate({ name, username, password, role })
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={backdropStyle} />

      {/* Modal */}
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h3 style={modalTitleStyle}>Nieuwe medewerker</h3>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Volledige naam">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jan de Monteur"
              style={inputStyle}
            />
          </Field>

          <Field label="Gebruikersnaam">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="jan"
              style={inputStyle}
            />
          </Field>

          <Field label="Wachtwoord">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </Field>

          <Field label="Rol">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <RoleOption value="mechanic" current={role} set={setRole} label="Monteur" />
              <RoleOption value="admin"    current={role} set={setRole} label="Beheerder" />
            </div>
          </Field>

          {error && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
            <button onClick={onClose} style={cancelButtonStyle}>Annuleren</button>
            <button
              onClick={handleSubmit}
              disabled={loading || !name || !username || !password}
              style={submitButtonStyle}
            >
              {loading ? 'Opslaan...' : 'Aanmaken'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  )
}

function RoleOption({ value, current, set, label }: { value: 'mechanic' | 'admin'; current: string; set: (v: 'mechanic' | 'admin') => void; label: string }) {
  const active = current === value
  return (
    <button
      onClick={() => set(value)}
      style={{
        flex: 1,
        padding: '0.625rem',
        border: '1px solid',
        borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
        borderRadius: '2px',
        background: active ? 'rgba(184,39,45,0.1)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '0.85rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

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

function roleBadgeStyle(role: string): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '2px',
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    background: role === 'admin' ? 'rgba(184,39,45,0.1)' : 'rgba(255,255,255,0.06)',
    color: role === 'admin' ? 'var(--color-accent)' : 'var(--color-text-muted)',
  }
}

const mutedStyle: React.CSSProperties       = { color: 'var(--color-text-muted)', fontSize: '0.85rem' }
const filterRowStyle: React.CSSProperties   = { display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }
const searchStyle: React.CSSProperties      = { padding: '0.625rem 0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }
const addButtonStyle: React.CSSProperties   = { padding: '0.625rem 1rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '4px', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }
const tableWrapStyle: React.CSSProperties   = { overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '4px' }
const tableStyle: React.CSSProperties       = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const trStyle: React.CSSProperties          = { borderBottom: '1px solid var(--color-border)' }
const tdStyle: React.CSSProperties          = { padding: '0.75rem 1rem', verticalAlign: 'middle' }
const avatarStyle: React.CSSProperties      = { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }
const backdropStyle: React.CSSProperties    = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }
const modalStyle: React.CSSProperties       = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1.5rem', width: '100%', maxWidth: '420px', maxHeight: '90dvh', overflowY: 'auto' }
const modalHeaderStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }
const modalTitleStyle: React.CSSProperties  = { fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }
const closeButtonStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1rem', cursor: 'pointer', padding: '0.25rem' }
const fieldLabelStyle: React.CSSProperties  = { display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties       = { display: 'block', width: '100%', padding: '0.625rem 0.875rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }
const cancelButtonStyle: React.CSSProperties = { flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }
const submitButtonStyle: React.CSSProperties = { flex: 2, padding: '0.75rem', background: 'var(--color-accent)', border: 'none', borderRadius: '2px', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }
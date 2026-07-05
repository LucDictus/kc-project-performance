import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import { useEmployeeDetail } from '../../hooks/useEmployeeDetail'
import { useUpdateEmployee } from '../../hooks/useUpdateEmployee'
import type { DayRow, ProjectRow } from '../../hooks/useEmployeeDetail'

function getMonthRange(offset: number = 0) {
  const d     = new Date()
  const year  = d.getFullYear()
  const month = d.getMonth() + offset
  const from  = new Date(year, month, 1)
  const to    = new Date(year, month + 1, 0)
  return {
    from:  from.toISOString().slice(0, 10),
    to:    to.toISOString().slice(0, 10),
    label: from.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }),
  }
}

export default function EmployeeDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)
  const [editOpen, setEditOpen] = useState(false)

  const period = getMonthRange(offset)
  const { data, isLoading, error } = useEmployeeDetail(
    id ? Number(id) : null,
    period.from,
    period.to,
  )
  const updateEmployee = useUpdateEmployee()

  return (
    <PageLayout title="Medewerker">
      <button onClick={() => navigate('/admin', { state: { tab: 'employees' } })} style={backButtonStyle}>
        ← Terug naar dashboard
      </button>

      {isLoading && <p style={mutedStyle}>Laden...</p>}
      {error     && <p style={{ color: 'var(--color-danger)' }}>Fout bij laden</p>}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.25rem' }}>

          {/* Medewerker info */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={avatarLargeStyle}>
                  {data.employee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={nameStyle}>{data.employee.name}</h2>
                  <p style={mutedStyle}>@{data.employee.username}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.375rem' }}>
                    <span style={roleBadgeStyle(data.employee.role)}>
                      {data.employee.role === 'admin' ? 'Beheerder' : 'Monteur'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: data.employee.is_active ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {data.employee.is_active ? 'Actief' : 'Inactief'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setEditOpen(true)} style={editButtonStyle}>
                Bewerken
              </button>
            </div>

            <div style={infoGridStyle}>
              <InfoItem label="Rol"               value={data.employee.role === 'admin' ? 'Beheerder' : 'Monteur'} />
              <InfoItem label="In dienst sinds"   value={formatDate(data.employee.created_at)} />
              <InfoItem label="Uren deze periode" value={formatMinutes(data.total_minutes)} />
            </div>

            {/* Deactiveren / activeren */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={() => updateEmployee.mutate({
                  id: data.employee.id,
                  is_active: !data.employee.is_active,
                })}
                disabled={updateEmployee.isPending}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '2px',
                  border: '1px solid',
                  borderColor: data.employee.is_active ? 'var(--color-danger)' : 'var(--color-success)',
                  background: 'transparent',
                  color: data.employee.is_active ? 'var(--color-danger)' : 'var(--color-success)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {updateEmployee.isPending
                  ? 'Opslaan...'
                  : data.employee.is_active
                  ? 'Medewerker deactiveren'
                  : 'Medewerker activeren'}
              </button>
            </div>
          </div>

          {/* Periode navigatie */}
          <div style={periodBarStyle}>
            <button onClick={() => setOffset(o => o - 1)} style={periodNavStyle}>←</button>
            <span style={periodLabelStyle}>{period.label}</span>
            <button
              onClick={() => setOffset(o => o + 1)}
              disabled={offset >= 0}
              style={{ ...periodNavStyle, opacity: offset >= 0 ? 0.3 : 1 }}
            >
              →
            </button>
          </div>

          {/* Uren per dag */}
          <section>
            <h3 style={sectionTitleStyle}>Uren per dag</h3>
            {data.days.length === 0 ? (
              <p style={mutedStyle}>Geen geregistreerde uren in deze periode.</p>
            ) : (
              <div style={tableWrapStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <Th>Datum</Th>
                      <Th>Ingeklokt</Th>
                      <Th>Uitgeklokt</Th>
                      <Th>Totaal</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.days.map((day: DayRow) => (
                      <tr key={day.date} style={trStyle}>
                        <td style={tdStyle}>{formatDate(day.date)}</td>
                        <td style={tdStyle}>{formatTime(day.first_clock_in)}</td>
                        <td style={tdStyle}>{formatTime(day.last_clock_out)}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                          {formatMinutes(day.total_minutes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                      <td colSpan={3} style={{ ...tdStyle, fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.06em' }}>
                        Totaal
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent)' }}>
                        {formatMinutes(data.total_minutes)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>

          {/* Projecten */}
          <section>
            <h3 style={sectionTitleStyle}>Projecten</h3>
            {data.projects.length === 0 ? (
              <p style={mutedStyle}>Geen projecten in deze periode.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {data.projects.map((p: ProjectRow) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/admin/projects/${p.id}`)}
                    style={{ ...projectCardStyle, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span style={licensePlateStyle}>{p.car_license_plate}</span>
                        <span style={mutedStyle}>{p.project_number}</span>
                      </div>
                      <span style={statusBadgeStyle(p.status)}>
                        {p.status === 'open' ? 'Open' : p.status === 'on_hold' ? 'On hold' : 'Gesloten'}
                      </span>
                    </div>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{p.car_make_model}</p>
                    <p style={mutedStyle}>{p.customer_name}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <span style={mutedStyle}>{p.session_count} {p.session_count === 1 ? 'sessie' : 'sessies'}</span>
                      <span style={{ ...mutedStyle, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text)' }}>
                        {formatMinutes(p.total_minutes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && data && (
        <EditEmployeeModal
          employee={data.employee}
          onClose={() => setEditOpen(false)}
          onSave={async (input) => {
            await updateEmployee.mutateAsync({ id: data.employee.id, ...input })
            setEditOpen(false)
          }}
          loading={updateEmployee.isPending}
          error={updateEmployee.error?.message ?? null}
        />
      )}
    </PageLayout>
  )
}

/* ─── Edit modal ─── */
function EditEmployeeModal({ employee, onClose, onSave, loading, error }: {
  employee: { name: string; username: string; role: 'mechanic' | 'admin' }
  onClose: () => void
  onSave: (input: { name: string; username: string; role: 'mechanic' | 'admin'; password?: string }) => Promise<void>
  loading: boolean
  error: string | null
}) {
  const [name,     setName]     = useState(employee.name)
  const [username, setUsername] = useState(employee.username)
  const [role,     setRole]     = useState<'mechanic' | 'admin'>(employee.role)
  const [password, setPassword] = useState('')

  async function handleSave() {
    const input: { name: string; username: string; role: 'mechanic' | 'admin'; password?: string } = { name, username, role }
    if (password.trim()) input.password = password.trim()
    await onSave(input)
  }

  return (
    <>
      <div onClick={onClose} style={backdropStyle} />
      <div style={modalStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Medewerker bewerken
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Volledige naam">
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Gebruikersnaam">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Nieuw wachtwoord">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leeg = ongewijzigd" style={inputStyle} />
          </Field>
          <Field label="Rol">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['mechanic', 'admin'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: '0.625rem',
                    border: '1px solid',
                    borderColor: role === r ? 'var(--color-accent)' : 'var(--color-border)',
                    borderRadius: '2px',
                    background: role === r ? 'rgba(184,39,45,0.1)' : 'transparent',
                    color: role === r ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {r === 'mechanic' ? 'Monteur' : 'Beheerder'}
                </button>
              ))}
            </div>
          </Field>

          {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
            <button onClick={onClose} style={cancelButtonStyle}>Annuleren</button>
            <button onClick={handleSave} disabled={loading || !name || !username} style={submitButtonStyle}>
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Kleine helpers ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{value}</p>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '0.625rem 1rem', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}
function formatMinutes(total: number) {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}u`
  return `${h}u ${m}m`
}
function roleBadgeStyle(role: string): React.CSSProperties {
  return { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase', background: role === 'admin' ? 'rgba(184,39,45,0.1)' : 'rgba(255,255,255,0.06)', color: role === 'admin' ? 'var(--color-accent)' : 'var(--color-text-muted)' }
}
function statusBadgeStyle(status: string): React.CSSProperties {
  const map: Record<string, { color: string; bg: string }> = {
    open:    { color: 'var(--color-success)',    bg: 'rgba(22,163,74,0.1)' },
    on_hold: { color: 'var(--color-text-muted)', bg: 'rgba(255,255,255,0.06)' },
    closed:  { color: 'var(--color-accent)',     bg: 'rgba(184,39,45,0.1)' },
  }
  const s = map[status] ?? map.open
  return { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase', background: s.bg, color: s.color }
}

const mutedStyle: React.CSSProperties        = { color: 'var(--color-text-muted)', fontSize: '0.8rem' }
const backButtonStyle: React.CSSProperties   = { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', cursor: 'pointer', padding: 0 }
const cardStyle: React.CSSProperties         = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1.25rem' }
const avatarLargeStyle: React.CSSProperties  = { width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', flexShrink: 0 }
const nameStyle: React.CSSProperties         = { fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.02em' }
const infoGridStyle: React.CSSProperties     = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }
const editButtonStyle: React.CSSProperties   = { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }
const periodBarStyle: React.CSSProperties    = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.625rem 1rem' }
const periodNavStyle: React.CSSProperties    = { background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1rem', cursor: 'pointer', padding: '0.25rem 0.5rem' }
const periodLabelStyle: React.CSSProperties  = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.04em', textTransform: 'capitalize' }
const sectionTitleStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }
const tableWrapStyle: React.CSSProperties    = { overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '4px' }
const tableStyle: React.CSSProperties        = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const trStyle: React.CSSProperties           = { borderBottom: '1px solid var(--color-border)' }
const tdStyle: React.CSSProperties           = { padding: '0.75rem 1rem', verticalAlign: 'middle' }
const projectCardStyle: React.CSSProperties  = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.875rem 1rem' }
const licensePlateStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-accent)', letterSpacing: '0.05em' }
const backdropStyle: React.CSSProperties     = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }
const modalStyle: React.CSSProperties        = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1.5rem', width: '100%', maxWidth: '420px', maxHeight: '90dvh', overflowY: 'auto' }
const inputStyle: React.CSSProperties        = { display: 'block', width: '100%', padding: '0.625rem 0.875rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }
const cancelButtonStyle: React.CSSProperties = { flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }
const submitButtonStyle: React.CSSProperties = { flex: 2, padding: '0.75rem', background: 'var(--color-accent)', border: 'none', borderRadius: '2px', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }
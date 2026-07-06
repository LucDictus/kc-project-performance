import { useState } from 'react'
import type { Project, ProjectStatus } from '../../../types/database'
import { useProjects } from '../../../hooks/useProjects'
import { useCreateProject } from '../../../hooks/useCreateProject'
import { useNavigate } from 'react-router-dom'

type StatusFilter = 'all' | ProjectStatus

export default function ProjectsTab() {
  const navigate = useNavigate()
  const { data: projects = [], isLoading, error } = useProjects()
  const createProject = useCreateProject()

  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [modalOpen, setModalOpen]     = useState(false)

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
  if (error)     return <p style={{ color: 'var(--color-danger)' }}>Fout bij laden van projecten</p>

  return (
    <>
      <div>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <input
            type="search"
            placeholder="Zoeken op kenteken, nummer, merk of klant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...searchStyle, flex: 1 }}
          />
          <button onClick={() => setModalOpen(true)} style={addButtonStyle}>
            + Nieuw
          </button>
        </div>

        <div style={filterRowStyle}>
          <FilterChip label="Alle"     value="all"     current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Open"     value="open"    current={statusFilter} set={setStatusFilter} />
          <FilterChip label="On hold"  value="on_hold" current={statusFilter} set={setStatusFilter} />
          <FilterChip label="Gesloten" value="closed"  current={statusFilter} set={setStatusFilter} />
        </div>

        {/* Resultaten */}
        <div style={{ marginTop: '1rem' }}>
          {filtered.length === 0 ? (
            <p style={mutedStyle}>Geen projecten gevonden.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {filtered.map((p: Project) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/admin/projects/${p.id}`, { state: { tab: 'projects' } })}
                  style={cardStyle}
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
      </div>

      {/* Modal */}
      {modalOpen && (
        <CreateProjectModal
          onClose={() => {
            setModalOpen(false)
            createProject.reset()
          }}
          onCreate={async (input) => {
            await createProject.mutateAsync(input)
            setModalOpen(false)
          }}
          loading={createProject.isPending}
          error={createProject.error?.message ?? null}
        />
      )}
    </>
  )
}

/* ─── Create modal ─── */
interface ModalProps {
  onClose: () => void
  onCreate: (input: { car_license_plate: string; car_make_model: string; customer_name: string }) => Promise<void>
  loading: boolean
  error: string | null
}

function CreateProjectModal({ onClose, onCreate, loading, error }: ModalProps) {
  const [licensePlate,  setLicensePlate]  = useState('')
  const [makeModel,     setMakeModel]     = useState('')
  const [customerName,  setCustomerName]  = useState('')

  async function handleSubmit() {
    if (!licensePlate || !makeModel || !customerName) return
    await onCreate({
      car_license_plate: licensePlate,
      car_make_model:    makeModel,
      customer_name:     customerName,
    })
  }

  return (
    <>
      <div onClick={onClose} style={backdropStyle} />
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h3 style={modalTitleStyle}>Nieuw project</h3>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Kenteken">
            <input
              type="text"
              value={licensePlate}
              onChange={e => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="AB-123-C"
              style={inputStyle}
            />
          </Field>

          <Field label="Merk & model">
            <input
              type="text"
              value={makeModel}
              onChange={e => setMakeModel(e.target.value)}
              placeholder="VW Golf 2019"
              style={inputStyle}
            />
          </Field>

          <Field label="Klantnaam">
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Jan Jansen"
              style={inputStyle}
            />
          </Field>

          {error && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
            <button onClick={onClose} style={cancelButtonStyle}>Annuleren</button>
            <button
              onClick={handleSubmit}
              disabled={loading || !licensePlate || !makeModel || !customerName}
              style={submitButtonStyle}
            >
              {loading ? 'Aanmaken...' : 'Aanmaken'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Helpers ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
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

const mutedStyle: React.CSSProperties        = { color: 'var(--color-text-muted)', fontSize: '0.8rem' }
const filterRowStyle: React.CSSProperties    = { display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }
const searchStyle: React.CSSProperties       = { padding: '0.625rem 0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }
const addButtonStyle: React.CSSProperties    = { padding: '0.625rem 1rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '4px', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }
const cardStyle: React.CSSProperties         = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.875rem 1rem', cursor: 'pointer', userSelect: 'none' }
const cardTopStyle: React.CSSProperties      = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const licensePlateStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-accent)', letterSpacing: '0.05em', marginRight: '0.625rem' }
const projectNumberStyle: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--color-text-muted)' }
const backdropStyle: React.CSSProperties     = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }
const modalStyle: React.CSSProperties        = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1.5rem', width: '100%', maxWidth: '420px', maxHeight: '90dvh', overflowY: 'auto' }
const modalHeaderStyle: React.CSSProperties  = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }
const modalTitleStyle: React.CSSProperties   = { fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }
const closeButtonStyle: React.CSSProperties  = { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1rem', cursor: 'pointer', padding: '0.25rem' }
const fieldLabelStyle: React.CSSProperties   = { display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties        = { display: 'block', width: '100%', padding: '0.625rem 0.875rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }
const cancelButtonStyle: React.CSSProperties = { flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }
const submitButtonStyle: React.CSSProperties = { flex: 2, padding: '0.75rem', background: 'var(--color-accent)', border: 'none', borderRadius: '2px', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }
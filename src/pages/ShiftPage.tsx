import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import { useCurrentShift } from '../hooks/useCurrentShift'
import { useStartShift, useStopShift } from '../hooks/useShiftActions'
import { useProjectSearch } from '../hooks/useProjectSearch'
import { useCreateProject } from '../hooks/useCreateProject'
import { useMyHours } from '../hooks/useMyHours'
import { api } from '../lib/api'
import { useQueryClient } from '@tanstack/react-query'
import type { DayRow, ProjectRow } from '../hooks/useEmployeeDetail'

type ShiftTab = 'shift' | 'hours'

function getUser() {
  const stored = localStorage.getItem('kc_user')
  return stored ? JSON.parse(stored) as { id: number; name: string; role: string } : null
}

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

export default function ShiftPage() {
  const user     = getUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ShiftTab>('shift')

  const { data: shift, isLoading } = useCurrentShift(user?.id ?? null)
  const startShift = useStartShift()
  const stopShift  = useStopShift()
  const qc         = useQueryClient()

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <PageLayout title="Mijn Werkdag">
      {/* Tab bar */}
      <div style={tabBarStyle}>
        <button
          onClick={() => setTab('shift')}
          style={{ ...tabButtonStyle, ...(tab === 'shift' ? tabActiveStyle : {}) }}
        >
          Mijn Dienst
        </button>
        <button
          onClick={() => setTab('hours')}
          style={{ ...tabButtonStyle, ...(tab === 'hours' ? tabActiveStyle : {}) }}
        >
          Mijn Uren
        </button>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {tab === 'shift' && (
          <>
            {isLoading ? (
              <p style={mutedStyle}>Laden...</p>
            ) : !shift ? (
              <NoShift
                onStart={async () => {
                  await startShift.mutateAsync(user.id)
                  qc.invalidateQueries({ queryKey: ['current-shift'] })
                }}
                loading={startShift.isPending}
              />
            ) : (
              <ActiveShift
                shift={shift}
                userId={user.id}
                onStop={async (description) => {
                  await stopShift.mutateAsync({ shift_id: shift.shift_id, description })
                }}
                stopLoading={stopShift.isPending}
              />
            )}
          </>
        )}

        {tab === 'hours' && (
          <MyHoursTab employeeId={user.id} />
        )}
      </div>
    </PageLayout>
  )
}

/* ─── Mijn Uren Tab ─── */
function MyHoursTab({ employeeId }: { employeeId: number }) {
  const [offset, setOffset] = useState(0)
  const period = getMonthRange(offset)
  const { data, isLoading, error } = useMyHours(employeeId, period.from, period.to)

  if (isLoading) return <p style={mutedStyle}>Laden...</p>
  if (error)     return <p style={{ color: 'var(--color-danger)' }}>Fout bij laden van uren</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

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

      {/* Totaal */}
      {data && (
        <div style={totalCardStyle}>
          <p style={totalLabelStyle}>Totaal gewerkt</p>
          <p style={totalValueStyle}>{formatMinutes(data.total_minutes)}</p>
        </div>
      )}

      {/* Uren per dag */}
      <section>
        <h3 style={sectionTitleStyle}>Uren per dag</h3>
        {!data || data.days.length === 0 ? (
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
        {!data || data.projects.length === 0 ? (
          <p style={mutedStyle}>Geen projecten in deze periode.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {data.projects.map((p: ProjectRow) => (
              <div key={p.id} style={projectCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={licensePlateStyle}>{p.car_license_plate}</span>
                    <span style={mutedStyle}>{p.project_number}</span>
                  </div>
                  <StatusBadge status={p.status} />
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
  )
}

/* ─── Geen dienst ─── */
function NoShift({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  return (
    <div style={centeredStyle}>
      <div style={bigIconStyle}>⏱</div>
      <h2 style={headingStyle}>Geen actieve dienst</h2>
      <p style={mutedStyle}>Druk op de knop om je dienst te starten.</p>
      <button onClick={onStart} disabled={loading} style={primaryButtonStyle}>
        {loading ? 'Starten...' : 'Dienst starten'}
      </button>
    </div>
  )
}

/* ─── Actieve dienst ─── */
function ActiveShift({
  shift, onStop, stopLoading
}: {
  shift: NonNullable<ReturnType<typeof useCurrentShift>['data']>
  userId: number
  onStop: (description?: string) => void
  stopLoading: boolean
}) {
  const qc = useQueryClient()
  const [view, setView]           = useState<'home' | 'search' | 'new-project'>('home')
  const [stopConfirm, setStopConfirm] = useState(false)
  const [description, setDescription] = useState('')

  async function handleStopSession(desc: string) {
    if (!shift.session_id) return
    await api.patch('/sessions/stop.php', {
      session_id: shift.session_id,
      description: desc,
    })
    qc.invalidateQueries({ queryKey: ['current-shift'] })
    setDescription('')
    setView('home')
  }

  async function handleStartSession(projectId: number) {
    await api.post('/sessions/index.php', {
      shift_id:   shift.shift_id,
      project_id: projectId,
    })
    qc.invalidateQueries({ queryKey: ['current-shift'] })
    setDescription('')
    setView('home')
  }

  if (view === 'search') {
    return (
      <ProjectSearch
        shiftId={shift.shift_id}
        onSelect={handleStartSession}
        onNewProject={() => setView('new-project')}
        onBack={() => setView('home')}
      />
    )
  }

  if (view === 'new-project') {
    return (
      <NewProjectForm
        shiftId={shift.shift_id}
        onCreated={handleStartSession}
        onBack={() => setView('search')}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={cardStyle}>
        <p style={cardLabelStyle}>Dienst gestart om</p>
        <p style={cardValueStyle}>{formatTime(shift.shift_started_at)}</p>
      </div>

      {shift.car_license_plate ? (
        <ActiveSessionCard
          shift={shift}
          description={description}
          onDescriptionChange={setDescription}
          onStop={handleStopSession}
          onSwitch={() => setView('search')}
        />
      ) : (
        <div style={cardStyle}>
          <p style={mutedStyle}>Geen actief project</p>
          <button onClick={() => setView('search')} style={{ ...primaryButtonStyle, marginTop: '0.875rem' }}>
            Project starten
          </button>
        </div>
      )}

      {!stopConfirm ? (
        <button onClick={() => setStopConfirm(true)} style={dangerButtonStyle}>
          Dienst stoppen
        </button>
      ) : (
        <div style={confirmCardStyle}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Dienst beëindigen?</p>
          <p style={mutedStyle}>Actieve projectsessie wordt ook gestopt.</p>
          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem' }}>
            <button onClick={() => setStopConfirm(false)} style={cancelButtonStyle}>Annuleren</button>
            <button onClick={() => onStop(description)} disabled={stopLoading} style={dangerButtonStyle}>
              {stopLoading ? 'Stoppen...' : 'Bevestigen'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Actieve sessie kaart ─── */
function ActiveSessionCard({
  shift, description, onDescriptionChange, onStop, onSwitch
}: {
  shift: NonNullable<ReturnType<typeof useCurrentShift>['data']>
  description: string
  onDescriptionChange: (v: string) => void
  onStop: (description: string) => void
  onSwitch: () => void
}) {
  const [stopConfirm, setStopConfirm] = useState(false)

  return (
    <div style={sessionCardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={licensePlateStyle}>{shift.car_license_plate}</span>
        <span style={mutedStyle}>{shift.project_number}</span>
      </div>

      <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{shift.car_make_model}</p>
      <p style={mutedStyle}>{shift.customer_name}</p>

      {shift.session_started_at && (
        <p style={{ ...mutedStyle, marginTop: '0.375rem' }}>
          Bezig sinds {formatTime(shift.session_started_at)}
        </p>
      )}

      <div style={{ marginTop: '1rem' }}>
        <label style={fieldLabelStyle}>Wat heb je gedaan?</label>
        <textarea
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder="Beschrijf kort het uitgevoerde werk..."
          rows={3}
          style={textareaStyle}
        />
      </div>

      {!stopConfirm ? (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
          <button onClick={onSwitch} style={cancelButtonStyle}>Wissel project</button>
          <button onClick={() => setStopConfirm(true)} style={primaryButtonStyle}>Stoppen</button>
        </div>
      ) : (
        <div style={{ marginTop: '0.875rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>Sessie stoppen?</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setStopConfirm(false)} style={cancelButtonStyle}>Terug</button>
            <button onClick={() => onStop(description)} style={primaryButtonStyle}>Bevestigen</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Project zoeken ─── */
function ProjectSearch({
  shiftId, onSelect, onNewProject, onBack
}: {
  shiftId: number
  onSelect: (projectId: number) => void
  onNewProject: () => void
  onBack: () => void
}) {
  const [query, setQuery] = useState('')
  const { data: results = [], isFetching } = useProjectSearch(query)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button onClick={onBack} style={backButtonStyle}>← Terug</button>

      <div>
        <label style={fieldLabelStyle}>Kenteken of projectnummer</label>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value.toUpperCase())}
          placeholder="bv. AB-123-C of KC-2026-001"
          autoFocus
          style={inputStyle}
        />
      </div>

      {isFetching && <p style={mutedStyle}>Zoeken...</p>}

      {query.length >= 2 && !isFetching && results.length === 0 && (
        <div style={cardStyle}>
          <p style={mutedStyle}>Geen projecten gevonden voor "{query}"</p>
          <button onClick={onNewProject} style={{ ...primaryButtonStyle, marginTop: '0.875rem' }}>
            Nieuw project aanmaken
          </button>
        </div>
      )}

      {results.map(p => (
        <button key={p.id} onClick={() => onSelect(p.id)} style={projectResultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={licensePlateStyle}>{p.car_license_plate}</span>
            <span style={mutedStyle}>{p.project_number}</span>
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem', textAlign: 'left' }}>{p.car_make_model}</p>
          <p style={{ ...mutedStyle, textAlign: 'left' }}>{p.customer_name}</p>
        </button>
      ))}
    </div>
  )
}

/* ─── Nieuw project formulier ─── */
function NewProjectForm({
  shiftId, onCreated, onBack
}: {
  shiftId: number
  onCreated: (projectId: number) => void
  onBack: () => void
}) {
  const createProject = useCreateProject()
  const [licensePlate, setLicensePlate] = useState('')
  const [makeModel,    setMakeModel]    = useState('')
  const [customerName, setCustomerName] = useState('')

  async function handleSubmit() {
    if (!licensePlate || !makeModel || !customerName) return
    const project = await createProject.mutateAsync({
      car_license_plate: licensePlate,
      car_make_model:    makeModel,
      customer_name:     customerName,
    })
    onCreated(project.id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button onClick={onBack} style={backButtonStyle}>← Terug</button>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Nieuw project
      </h2>

      <div>
        <label style={fieldLabelStyle}>Kenteken</label>
        <input
          type="text"
          value={licensePlate}
          onChange={e => setLicensePlate(e.target.value.toUpperCase())}
          placeholder="AB-123-C"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={fieldLabelStyle}>Merk & model</label>
        <input
          type="text"
          value={makeModel}
          onChange={e => setMakeModel(e.target.value)}
          placeholder="VW Golf 2019"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={fieldLabelStyle}>Klantnaam</label>
        <input
          type="text"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          placeholder="Jan Jansen"
          style={inputStyle}
        />
      </div>

      {createProject.error && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>
          {createProject.error.message}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={createProject.isPending || !licensePlate || !makeModel || !customerName}
        style={primaryButtonStyle}
      >
        {createProject.isPending ? 'Aanmaken...' : 'Project aanmaken & starten'}
      </button>
    </div>
  )
}

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    open:    { label: 'Open',     color: 'var(--color-success)',    bg: 'rgba(22,163,74,0.1)' },
    on_hold: { label: 'On hold',  color: 'var(--color-text-muted)', bg: 'rgba(255,255,255,0.06)' },
    closed:  { label: 'Gesloten', color: 'var(--color-accent)',     bg: 'rgba(184,39,45,0.1)' },
  }
  const s = map[status] ?? map.open
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

/* ─── Helpers ─── */
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

/* ─── Styles ─── */
const mutedStyle: React.CSSProperties         = { color: 'var(--color-text-muted)', fontSize: '0.85rem' }
const tabBarStyle: React.CSSProperties        = { display: 'flex', borderBottom: '1px solid var(--color-border)' }
const tabButtonStyle: React.CSSProperties     = { padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', transition: 'color 0.15s' }
const tabActiveStyle: React.CSSProperties     = { color: 'var(--color-accent)', borderBottom: '2px solid var(--color-accent)' }
const centeredStyle: React.CSSProperties      = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', minHeight: '60dvh', textAlign: 'center' }
const bigIconStyle: React.CSSProperties       = { fontSize: '3rem' }
const headingStyle: React.CSSProperties       = { fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }
const cardStyle: React.CSSProperties          = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1rem 1.25rem' }
const cardLabelStyle: React.CSSProperties     = { fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }
const cardValueStyle: React.CSSProperties     = { fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }
const sessionCardStyle: React.CSSProperties   = { background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: '4px', padding: '1rem 1.25rem' }
const confirmCardStyle: React.CSSProperties   = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1rem 1.25rem' }
const projectResultStyle: React.CSSProperties = { width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.875rem 1rem', cursor: 'pointer' }
const projectCardStyle: React.CSSProperties   = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.875rem 1rem' }
const licensePlateStyle: React.CSSProperties  = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-accent)', letterSpacing: '0.05em' }
const fieldLabelStyle: React.CSSProperties    = { display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties         = { display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '1rem', outline: 'none' }
const textareaStyle: React.CSSProperties      = { display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '1rem', outline: 'none', resize: 'vertical' }
const primaryButtonStyle: React.CSSProperties = { width: '100%', padding: '0.875rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '2px', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }
const dangerButtonStyle: React.CSSProperties  = { width: '100%', padding: '0.875rem', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '2px', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }
const cancelButtonStyle: React.CSSProperties  = { flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '2px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }
const backButtonStyle: React.CSSProperties    = { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', cursor: 'pointer', padding: 0, textAlign: 'left' }
const periodBarStyle: React.CSSProperties     = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.625rem 1rem' }
const periodNavStyle: React.CSSProperties     = { background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1rem', cursor: 'pointer', padding: '0.25rem 0.5rem' }
const periodLabelStyle: React.CSSProperties   = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.04em', textTransform: 'capitalize' }
const sectionTitleStyle: React.CSSProperties  = { fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }
const tableWrapStyle: React.CSSProperties     = { overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '4px' }
const tableStyle: React.CSSProperties         = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const trStyle: React.CSSProperties            = { borderBottom: '1px solid var(--color-border)' }
const tdStyle: React.CSSProperties            = { padding: '0.75rem 1rem', verticalAlign: 'middle' }
const totalCardStyle: React.CSSProperties     = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1rem 1.25rem' }
const totalLabelStyle: React.CSSProperties    = { fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }
const totalValueStyle: React.CSSProperties    = { fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)' }
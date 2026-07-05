import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import { useProjectDetail } from '../../hooks/useProjectDetail'
import type { SessionRow, EmployeeHours } from '../../hooks/useProjectDetail'
import type { ProjectStatus } from '../../types/database'

export default function ProjectDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error } = useProjectDetail(id ? Number(id) : null)

  return (
    <PageLayout title="Project">
      <button onClick={() => navigate('/admin', { state: { tab: 'projects' } })} style={backButtonStyle}>
        ← Terug naar dashboard
      </button>

      {isLoading && <p style={mutedStyle}>Laden...</p>}
      {error     && <p style={{ color: 'var(--color-danger)' }}>Fout bij laden</p>}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.25rem' }}>

          {/* Project info */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <span style={licensePlateStyle}>{data.project.car_license_plate}</span>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {data.project.car_make_model}
                </p>
              </div>
              <StatusBadge status={data.project.status} />
            </div>

            <div style={infoGridStyle}>
              <InfoItem label="Projectnummer" value={data.project.project_number} />
              <InfoItem label="Klant"         value={data.project.customer_name} />
              <InfoItem label="Aangemaakt"    value={formatDate(data.project.created_at)} />
              <InfoItem label="Totaal uren"   value={formatMinutes(data.total_minutes)} />
            </div>
          </div>

          {/* Uren per medewerker */}
          <section>
            <h3 style={sectionTitleStyle}>Uren per medewerker</h3>
            {data.per_employee.length === 0 ? (
              <p style={mutedStyle}>Nog geen uren geregistreerd.</p>
            ) : (
              <div style={tableWrapStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <Th>Medewerker</Th>
                      <Th>Sessies</Th>
                      <Th>Totaal</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.per_employee.map((e: EmployeeHours) => (
                      <tr
                        key={e.employee_id}
                        onClick={() => navigate(`/admin/employees/${e.employee_id}`)}
                        style={{ ...trStyle, cursor: 'pointer' }}
                      >
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={avatarStyle}>
                              {e.employee_name.charAt(0).toUpperCase()}
                            </div>
                            {e.employee_name}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>
                          {e.session_count} {e.session_count === 1 ? 'sessie' : 'sessies'}
                        </td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-accent)' }}>
                          {formatMinutes(e.total_minutes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                      <td colSpan={2} style={{ ...tdStyle, fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.06em' }}>
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

          {/* Sessies / werklog */}
          <section>
            <h3 style={sectionTitleStyle}>Werklog</h3>
            {data.sessions.length === 0 ? (
              <p style={mutedStyle}>Nog geen sessies geregistreerd.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {data.sessions.map((s: SessionRow) => (
                  <div key={s.session_id} style={sessionCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={avatarStyle}>
                          {s.employee_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.employee_name}</p>
                          <p style={mutedStyle}>{formatDate(s.date)}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                          {s.duration_minutes ? formatMinutes(s.duration_minutes) : (
                            <span style={{ color: 'var(--color-success)', fontSize: '0.8rem' }}>Actief</span>
                          )}
                        </p>
                        <p style={mutedStyle}>
                          {formatTime(s.started_at)}
                          {s.ended_at ? ` – ${formatTime(s.ended_at)}` : ''}
                        </p>
                      </div>
                    </div>

                    {s.description ? (
                      <div style={descriptionStyle}>
                        <p style={{ ...mutedStyle, marginBottom: '0.25rem', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                          Werkzaamheden
                        </p>
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{s.description}</p>
                      </div>
                    ) : (
                      <p style={{ ...mutedStyle, fontStyle: 'italic' }}>Geen beschrijving opgegeven.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}
    </PageLayout>
  )
}

/* ─── Helpers ─── */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
        {label}
      </p>
      <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{value}</p>
    </div>
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

function StatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
    open:    { label: 'Open',     color: 'var(--color-success)',    bg: 'rgba(22,163,74,0.1)' },
    on_hold: { label: 'On hold',  color: 'var(--color-text-muted)', bg: 'rgba(255,255,255,0.06)' },
    closed:  { label: 'Gesloten', color: 'var(--color-accent)',     bg: 'rgba(184,39,45,0.1)' },
  }
  const s = map[status]
  return (
    <span style={{
      padding: '0.3rem 0.75rem',
      borderRadius: '2px',
      fontSize: '0.8rem',
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

const mutedStyle: React.CSSProperties       = { color: 'var(--color-text-muted)', fontSize: '0.8rem' }
const backButtonStyle: React.CSSProperties  = { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', cursor: 'pointer', padding: 0 }
const cardStyle: React.CSSProperties        = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1.25rem' }
const infoGridStyle: React.CSSProperties    = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }
const sectionTitleStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }
const tableWrapStyle: React.CSSProperties   = { overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '4px' }
const tableStyle: React.CSSProperties       = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const trStyle: React.CSSProperties          = { borderBottom: '1px solid var(--color-border)' }
const tdStyle: React.CSSProperties          = { padding: '0.75rem 1rem', verticalAlign: 'middle' }
const sessionCardStyle: React.CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1rem' }
const descriptionStyle: React.CSSProperties = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '2px', padding: '0.75rem', marginTop: '0.5rem' }
const avatarStyle: React.CSSProperties      = { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }
const licensePlateStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--color-accent)', letterSpacing: '0.05em' }
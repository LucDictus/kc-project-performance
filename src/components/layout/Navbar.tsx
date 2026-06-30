import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface NavbarProps {
  title?: string
}

export default function Navbar({ title }: NavbarProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const stored = localStorage.getItem('kc_user')
  const user = stored ? JSON.parse(stored) : null

  function handleLogout() {
    localStorage.removeItem('kc_user')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <nav style={navStyle}>
        {/* Links: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={logoStyle}>KC</span>
          {title && (
            <span style={titleStyle}>{title}</span>
          )}
        </div>

        {/* Rechts: naam + menu toggle */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={avatarButtonStyle}
            aria-label="Gebruikersmenu"
          >
            <span style={avatarStyle}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </span>
            <span style={userNameStyle}>{user?.name}</span>
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ color: 'var(--color-text-muted)', transition: 'transform 0.15s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div style={dropdownStyle}>
              {/* Profiel info */}
              <div style={dropdownHeaderStyle}>
                <div style={{ ...avatarStyle, width: '40px', height: '40px', fontSize: '1.125rem' }}>
                  {user?.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                    {user?.role === 'admin' ? 'Beheerder' : 'Monteur'}
                  </p>
                </div>
              </div>

              <div style={dropdownDividerStyle} />

              {/* Uitloggen */}
              <button onClick={handleLogout} style={dropdownItemStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay om dropdown te sluiten */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9 }}
        />
      )}
    </>
  )
}

const navStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 1.25rem',
  height: '56px',
  background: 'var(--color-bg)',
  borderBottom: '1px solid var(--color-border)',
}

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'var(--color-accent)',
  letterSpacing: '0.05em',
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
}

const avatarButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  color: 'var(--color-text)',
}

const avatarStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'var(--color-accent)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '0.875rem',
  flexShrink: 0,
}

const userNameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--color-text)',
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 0.5rem)',
  right: 0,
  zIndex: 20,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  minWidth: '200px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  overflow: 'hidden',
}

const dropdownHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
}

const dropdownDividerStyle: React.CSSProperties = {
  height: '1px',
  background: 'var(--color-border)',
  margin: '0',
}

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-danger)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  textAlign: 'left',
}
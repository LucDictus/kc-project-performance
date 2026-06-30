import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('kc_user')
    if (stored) {
      const user = JSON.parse(stored)
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/shift', { replace: true })
      }
    }
  }, [navigate])

  async function handleLogin() {
  setError(null)
  setLoading(true)

  const { data, error } = await supabase
    .from('employees')
    .select('id, name, role, username')
    .eq('username', username)
    .eq('password_hash', password) // ⚠ temporary MVP check
    .eq('is_active', true)
    .single()

  if (error || !data) {
    setError('Gebruikersnaam of wachtwoord onjuist.')
    return
  }

  const user = data as {
    id: string
    name: string
    role: 'admin' | 'mechanic'
    username: string
  }  

  setLoading(false)

  if (error || !data) {
    setError('Gebruikersnaam of wachtwoord onjuist.')
    return
  }

  localStorage.setItem(
    'kc_user',
    JSON.stringify({
      id: user.id,
      name: user.name,
      role: user.role,
    })
  )

  if (user.role === 'admin') {
    navigate('/admin', { replace: true })
  } else {
    navigate('/shift', { replace: true })
  }
}

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--color-bg)',
    }}>
      {/* Logo / merk */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
        }}>
          KCPerformance
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Project Registratie
        </p>
      </div>

      {/* Login card */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        padding: '2rem',
      }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Gebruikersnaam</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? 'Inloggen...' : 'Inloggen'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  marginBottom: '0.5rem',
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: '2px',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  outline: 'none',
}

const buttonStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.875rem',
  background: 'var(--color-accent)',
  color: '#ffffff',           // ← was #000
  fontFamily: 'var(--font-display)',
  fontSize: '1rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  border: 'none',
  borderRadius: '2px',
  cursor: 'pointer',
}
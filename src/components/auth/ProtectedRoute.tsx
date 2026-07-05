import { Navigate } from 'react-router-dom'

type Role = 'admin' | 'mechanic'

interface Props {
  children: React.ReactNode
  requiredRole?: Role
}

function getUser() {
  const stored = localStorage.getItem('kc_user')
  if (!stored) return null
  try {
    return JSON.parse(stored) as { id: number; name: string; role: Role }
  } catch {
    return null
  }
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const user = getUser()

  // Niet ingelogd
  if (!user) return <Navigate to="/login" replace />

  // Verkeerde rol
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/shift'} replace />
  }

  return <>{children}</>
}
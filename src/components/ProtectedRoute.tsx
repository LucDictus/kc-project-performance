import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

type User = {
  role: 'admin' | 'mechanic'
}

export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode
  role?: User['role']
}) {
  const stored = localStorage.getItem('kc_user')
  const user: User | null = stored ? JSON.parse(stored) : null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />
  }

  return children
}
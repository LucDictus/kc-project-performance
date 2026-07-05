import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ShiftPage from './pages/ShiftPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import EmployeeDetailPage from './pages/admin/EmployeeDetailPage'
import ProjectDetailPage from './pages/admin/ProjectDetailPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/shift"
          element={
            <ProtectedRoute requiredRole="mechanic">
              <ShiftPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/employees/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/projects/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
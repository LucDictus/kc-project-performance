import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ShiftPage from './pages/ShiftPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import EmployeeDetailPage from './pages/admin/EmployeeDetailPage'
import ProjectDetailPage from './pages/admin/ProjectDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/shift"
          element={
            <ProtectedRoute>
              <ShiftPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/admin/employees/:id"     
          element={
            <ProtectedRoute role="admin">
              <EmployeeDetailPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/projects/:id"       
          element={
            <ProtectedRoute role="admin">
              <ProjectDetailPage />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
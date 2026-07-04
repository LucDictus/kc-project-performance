export type EmployeeRole = 'mechanic' | 'admin'
export type ProjectStatus = 'open' | 'on_hold' | 'closed'

export interface Employee {
  id: number
  name: string
  role: EmployeeRole
  username: string
  is_active: boolean
  created_at: string
}

export interface Shift {
  id: number
  employee_id: number
  started_at: string
  ended_at: string | null
  total_minutes: number | null
  created_at: string
}

export interface Project {
  id: number
  project_number: string
  car_license_plate: string
  car_make_model: string
  customer_name: string
  status: ProjectStatus
  created_at: string
}

export interface ProjectSession {
  id: number
  shift_id: number
  project_id: number
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  description: string | null
  created_at: string
}

export interface ActiveNowView {
  employee_id: number
  employee_name: string
  shift_id: number
  shift_started_at: string
  session_id: number | null
  project_id: number | null
  project_number: string | null
  car_license_plate: string | null
  car_make_model: string | null
  session_started_at: string | null
}

export interface HoursPerEmployeeView {
  employee_id: number
  employee_name: string
  total_minutes: number
}

export interface HoursPerProjectView {
  project_id: number
  project_number: string
  car_license_plate: string
  car_make_model: string
  total_minutes: number
}
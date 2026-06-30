export type EmployeeRole = 'mechanic' | 'admin'
export type ProjectStatus = 'open' | 'on_hold' | 'closed'

export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  username: string
  password_hash: string
  is_active: boolean
  created_at: string
}

export interface Shift {
  id: string
  employee_id: string
  started_at: string
  ended_at: string | null
  total_minutes: number | null
  created_at: string
}

export interface Project {
  id: string
  project_number: string
  car_license_plate: string
  car_make_model: string
  customer_name: string
  status: ProjectStatus
  created_at: string
}

export interface ProjectSession {
  id: string
  shift_id: string
  project_id: string
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  description: string | null
  created_at: string
}

// Joined types voor queries met relaties
export interface ShiftWithEmployee extends Shift {
  employee: Employee
}

export interface ProjectSessionWithProject extends ProjectSession {
  project: Project
}

export interface ShiftWithSessions extends Shift {
  employee: Employee
  project_sessions: ProjectSessionWithProject[]
}

// View types
export interface ActiveNowView {
  employee_id: string
  employee_name: string
  shift_id: string
  shift_started_at: string
  session_id: string | null
  project_id: string | null
  project_number: string | null
  car_license_plate: string | null
  car_make_model: string | null
  session_started_at: string | null
}

export interface HoursPerEmployeeView {
  employee_id: string
  employee_name: string
  total_minutes: number
}

export interface HoursPerProjectView {
  project_id: string
  project_number: string
  car_license_plate: string
  car_make_model: string
  total_minutes: number
}

// Supabase Database type wrapper
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: Employee
        Insert: Omit<Employee, 'id' | 'created_at'>
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>
      }
      shifts: {
        Row: Shift
        Insert: Omit<Shift, 'id' | 'created_at'>
        Update: Partial<Omit<Shift, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
      }
      project_sessions: {
        Row: ProjectSession
        Insert: Omit<ProjectSession, 'id' | 'created_at'>
        Update: Partial<Omit<ProjectSession, 'id' | 'created_at'>>
      }
    }
    Views: {
      v_active_now: { Row: ActiveNowView }
      v_hours_per_employee: { Row: HoursPerEmployeeView }
      v_hours_per_project: { Row: HoursPerProjectView }
    }
  }
}
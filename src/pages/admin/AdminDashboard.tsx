import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import OverviewTab from './tabs/OverviewTab'
import ActiveTab from './tabs/ActiveTab'
import EmployeesTab from './tabs/EmployeesTab'
import ProjectsTab from './tabs/ProjectsTab'

type Tab = 'overview' | 'active' | 'employees' | 'projects'

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview',  label: 'Overzicht' },
  { id: 'active',    label: 'Actief' },
  { id: 'employees', label: 'Medewerkers' },
  { id: 'projects',  label: 'Projecten' },
]

export default function AdminDashboard() {
  const location = useLocation()
  const returnTab = (location.state as { tab?: Tab } | null)?.tab ?? 'overview'
  const [activeTab, setActiveTab] = useState<Tab>(returnTab)

  return (
    <PageLayout title="Dashboard">
      <div style={tabBarStyle}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...tabButtonStyle,
              ...(activeTab === tab.id ? tabButtonActiveStyle : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {activeTab === 'overview'  && <OverviewTab />}
        {activeTab === 'active'    && <ActiveTab />}
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab === 'projects'  && <ProjectsTab />}
      </div>
    </PageLayout>
  )
}

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid var(--color-border)',
  overflowX: 'auto',
}

const tabButtonStyle: React.CSSProperties = {
  padding: '0.75rem 1.25rem',
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  cursor: 'pointer',
  fontFamily: 'var(--font-display)',
  fontSize: '0.95rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  whiteSpace: 'nowrap',
  transition: 'color 0.15s',
}

const tabButtonActiveStyle: React.CSSProperties = {
  color: 'var(--color-accent)',
  borderBottom: '2px solid var(--color-accent)',
}
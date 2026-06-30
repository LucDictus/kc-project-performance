import { useState } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import ActiveTab from './tabs/ActiveTab'
import EmployeesTab from './tabs/EmployeesTab'
import ProjectsTab from './tabs/ProjectsTab'

type Tab = 'active' | 'employees' | 'projects'

const tabs: { id: Tab; label: string }[] = [
  { id: 'active', label: 'Actief' },
  { id: 'employees', label: 'Medewerkers' },
  { id: 'projects', label: 'Projecten' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('active')

  return (
    <PageLayout title="Dashboard">
      {/* Tab bar */}
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
            {activeTab === tab.id && <div style={tabIndicatorStyle} />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ marginTop: '1.5rem' }}>
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
  gap: '0',
  marginBottom: '-1px',
}

const tabButtonStyle: React.CSSProperties = {
  position: 'relative',
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
  transition: 'color 0.15s',
  whiteSpace: 'nowrap',
}

const tabButtonActiveStyle: React.CSSProperties = {
  color: 'var(--color-accent)',
  borderBottom: '2px solid var(--color-accent)',
}

const tabIndicatorStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-1px',
  left: 0,
  right: 0,
  height: '2px',
  background: 'var(--color-accent)',
}
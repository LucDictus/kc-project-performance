import type { ReactNode } from 'react'
import Navbar from './Navbar'

interface PageLayoutProps {
  children: ReactNode
  title?: string
}

export default function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Navbar title={title} />
      <main style={{ flex: 1, padding: '1.5rem 1.25rem' }}>
        {children}
      </main>
    </div>
  )
}
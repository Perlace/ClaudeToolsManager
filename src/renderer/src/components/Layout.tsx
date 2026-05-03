import { useState } from 'react'
import { LayoutDashboard, Wrench, Settings as SettingsIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Dashboard } from '../pages/Dashboard'
import { ToolsPage } from '../pages/ToolsPage'
import { Settings } from '../pages/Settings'
import { useToolStore } from '../store/toolStore'

type Page = 'dashboard' | 'tools' | 'settings'

export function Layout() {
  const [page, setPage] = useState<Page>('dashboard')
  const { activeCategory } = useToolStore()

  const showSidebar = page === 'tools'

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left nav */}
        <nav className="flex flex-col items-center gap-1 px-2 py-4 border-r border-border bg-surface/50 shrink-0">
          <NavBtn
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={page === 'dashboard'}
            onClick={() => setPage('dashboard')}
          />
          <NavBtn
            icon={<Wrench size={18} />}
            label="Outils"
            active={page === 'tools'}
            onClick={() => setPage('tools')}
          />
          <div className="flex-1" />
          <NavBtn
            icon={<SettingsIcon size={18} />}
            label="Paramètres"
            active={page === 'settings'}
            onClick={() => setPage('settings')}
          />
        </nav>

        {/* Sidebar (only for tools) */}
        {showSidebar && <Sidebar />}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scrollable">
          {page === 'dashboard' && <Dashboard />}
          {page === 'tools' && <ToolsPage />}
          {page === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}

function NavBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={label}
      className={[
        'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all no-drag',
        active
          ? 'text-accent bg-accent-dim shadow-glow'
          : 'text-text-muted hover:text-text hover:bg-card',
      ].join(' ')}
    >
      {icon}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent -ml-2"
        />
      )}
    </motion.button>
  )
}

import { motion } from 'framer-motion'
import { LayoutGrid } from 'lucide-react'
import { useToolStore } from '../store/toolStore'
import { CATEGORIES } from '../data/tools'
import { LogoIcon } from './Logo'

export function Sidebar() {
  const { activeCategory, setActiveCategory, tools } = useToolStore()

  const counts = Object.fromEntries(
    CATEGORIES.map((c) => [c.id, tools.filter((t) => t.category === c.id).length])
  )
  const enabledCounts = Object.fromEntries(
    CATEGORIES.map((c) => [c.id, tools.filter((t) => t.category === c.id && t.isEnabled).length])
  )

  const totalEnabled = tools.filter((t) => t.isEnabled).length

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-1 py-4 px-3 border-r border-border bg-surface/50">
      {/* Logo */}
      <div className="px-3 pb-4 pt-1 titlebar-drag">
        <div className="flex items-center gap-2.5 no-drag">
          <div className="shrink-0 shadow-glow rounded-lg">
            <LogoIcon size={32} />
          </div>
          <div>
            <div className="text-sm font-bold text-gradient-accent leading-tight">Claude Tools</div>
            <div className="text-2xs text-text-muted">Manager v1.1</div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border mx-2 mb-2" />

      {/* All tools */}
      <SidebarItem
        icon={<LayoutGrid size={15} />}
        label="Tous les outils"
        count={tools.length}
        enabledCount={totalEnabled}
        isActive={activeCategory === 'all'}
        color="#ff6b35"
        onClick={() => setActiveCategory('all')}
      />

      <div className="h-px bg-border mx-2 my-1" />
      <div className="px-3 py-1">
        <span className="text-2xs font-semibold text-text-dim uppercase tracking-widest">Catégories</span>
      </div>

      {/* Categories */}
      {CATEGORIES.map((cat) => (
        <SidebarItem
          key={cat.id}
          icon={<span className="text-sm">{cat.icon}</span>}
          label={cat.name}
          count={counts[cat.id]}
          enabledCount={enabledCounts[cat.id]}
          isActive={activeCategory === cat.id}
          color={cat.color}
          onClick={() => setActiveCategory(cat.id)}
        />
      ))}
    </aside>
  )
}

function SidebarItem({
  icon,
  label,
  count,
  enabledCount,
  isActive,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  count: number
  enabledCount: number
  isActive: boolean
  color: string
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={[
        'relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 no-drag',
        isActive
          ? 'text-text'
          : 'text-text-secondary hover:text-text hover:bg-card',
      ].join(' ')}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <span className="relative shrink-0" style={{ color: isActive ? color : undefined }}>
        {icon}
      </span>
      <span className="relative flex-1 text-xs font-medium leading-tight truncate">{label}</span>
      <div className="relative flex items-center gap-1">
        {enabledCount > 0 && (
          <span
            className="text-2xs font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: `${color}20`, color }}
          >
            {enabledCount}
          </span>
        )}
        <span className="text-2xs text-text-dim font-medium">{count}</span>
      </div>
    </motion.button>
  )
}

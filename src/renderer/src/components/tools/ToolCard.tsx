import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { Toggle } from '../common/Toggle'
import { TokenBadge } from '../common/Badge'
import { useToolStore } from '../../store/toolStore'
import { CATEGORIES } from '../../data/tools'
import type { Tool } from '../../types'

interface ToolCardProps {
  tool: Tool
  onDetail: (tool: Tool) => void
  index: number
}

export function ToolCard({ tool, onDetail, index }: ToolCardProps) {
  const { toggleTool, pendingChanges } = useToolStore()
  const category = CATEGORIES.find((c) => c.id === tool.category)
  const isPending = pendingChanges.has(tool.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={[
        'group card p-4 flex flex-col gap-3 relative overflow-hidden',
        tool.isEnabled
          ? 'border-accent/30 bg-gradient-to-br from-card to-accent-dim shadow-glow'
          : 'hover:bg-card-hover hover:border-border-light cursor-pointer',
        isPending ? 'opacity-60' : '',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-110"
          style={{
            background: `${category?.color}18`,
            border: `1px solid ${category?.color}35`,
          }}
        >
          {category?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text leading-tight">{tool.name}</h3>
            {tool.isImported && (
              <span className="badge badge-purple text-2xs">Custom</span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      {/* Token badge */}
      <div className="flex items-center gap-2">
        <TokenBadge impact={tool.tokenImpact} estimate={tool.tokenEstimate} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/50">
        <button
          onClick={() => onDetail(tool)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors no-drag"
          title="Voir les détails"
        >
          <Info size={13} />
          <span>Détails</span>
        </button>
        <Toggle
          checked={tool.isEnabled}
          onChange={() => toggleTool(tool.id)}
          disabled={isPending}
          size="sm"
        />
      </div>

      {/* Active glow bar */}
      {tool.isEnabled && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${category?.color}, transparent)` }}
        />
      )}
    </motion.div>
  )
}

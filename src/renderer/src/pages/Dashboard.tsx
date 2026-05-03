import { motion } from 'framer-motion'
import { Zap, TrendingDown, Package, Shield } from 'lucide-react'
import { useToolStore } from '../store/toolStore'
import { CATEGORIES } from '../data/tools'

export function Dashboard() {
  const { tools, claudeInfo, getEnabledCount, getTokenSavings } = useToolStore()
  const enabledCount = getEnabledCount()
  const tokenSavings = getTokenSavings()

  const securityEnabled = tools.filter((t) => t.category === 'security' && t.isEnabled).length
  const tokenEnabled = tools.filter((t) => t.category === 'tokens' && t.isEnabled).length

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text">
          Bonjour 👋{' '}
          <span className="text-gradient-accent">Claude Tools Manager</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Gérez vos outils Claude Code pour booster vos projets web.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap size={18} className="text-accent" />}
          label="Outils actifs"
          value={enabledCount}
          total={tools.length}
          color="#ff6b35"
        />
        <StatCard
          icon={<TrendingDown size={18} className="text-green" />}
          label="Impact tokens"
          value={tokenSavings > 0 ? `-${tokenSavings}%` : tokenSavings < 0 ? `+${Math.abs(tokenSavings)}%` : '0%'}
          subtitle={tokenSavings < 0 ? 'surcoût' : tokenSavings > 0 ? 'économies' : 'neutre'}
          color={tokenSavings > 0 ? '#22c55e' : tokenSavings < 0 ? '#ef4444' : '#f59e0b'}
          isText
        />
        <StatCard
          icon={<Shield size={18} className="text-red" />}
          label="Sécurité"
          value={securityEnabled}
          total={tools.filter((t) => t.category === 'security').length}
          color="#ef4444"
        />
        <StatCard
          icon={<Package size={18} className="text-purple" />}
          label="Token savings"
          value={tokenEnabled}
          total={tools.filter((t) => t.category === 'tokens').length}
          color="#7c3aed"
        />
      </div>

      {/* Claude status */}
      {claudeInfo && (
        <div className="card p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${claudeInfo.found ? 'bg-green-dim' : 'bg-red-dim'}`}>
            <span className="text-xl">{claudeInfo.found ? '✅' : '❌'}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-text">
              Claude Code{claudeInfo.found ? ` ${claudeInfo.version || ''}`.trim() : ' — Non détecté'}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 font-mono">
              {claudeInfo.found ? claudeInfo.settingsPath : 'Installez Claude Code pour activer les outils'}
            </div>
          </div>
          {claudeInfo.found && (
            <div className="flex items-center gap-1.5">
              <div className="dot-enabled" />
              <span className="text-xs text-green font-medium">Connecté</span>
            </div>
          )}
        </div>
      )}

      {/* Category overview */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Vue par catégorie
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((cat, i) => {
            const catTools = tools.filter((t) => t.category === cat.id)
            const catEnabled = catTools.filter((t) => t.isEnabled).length
            const pct = catTools.length > 0 ? Math.round((catEnabled / catTools.length) * 100) : 0
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4"
                style={catEnabled > 0 ? { borderColor: `${cat.color}40` } : {}}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-semibold text-text truncate">{cat.name}</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold" style={{ color: cat.color }}>
                    {catEnabled}
                  </span>
                  <span className="text-xs text-text-muted">/ {catTools.length}</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${cat.color}80, ${cat.color})` }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick tips */}
      <div className="card p-4 border-accent/20 bg-accent-dim/10">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <div className="text-sm font-semibold text-text mb-1">Conseil du jour</div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Activez <strong className="text-accent">Context Compressor</strong> +{' '}
              <strong className="text-accent">Memory Architect</strong> ensemble pour réduire vos
              coûts de tokens jusqu'à 45% sur les longues sessions de développement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  total,
  subtitle,
  color,
  isText = false,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  total?: number
  subtitle?: string
  color: string
  isText?: boolean
}) {
  return (
    <div className="card p-4" style={{ borderColor: `${color}25` }}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}15` }}
      >
        {icon}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold" style={{ color }}>
          {value}
        </span>
        {total !== undefined && (
          <span className="text-sm text-text-muted pb-0.5">/ {total}</span>
        )}
      </div>
      <div className="text-xs text-text-secondary mt-1">{subtitle || label}</div>
    </div>
  )
}

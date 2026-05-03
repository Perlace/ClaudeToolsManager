import { motion, AnimatePresence } from 'framer-motion'
import { X, Lightbulb, Code2, Zap, Shield, BookOpen } from 'lucide-react'
import { Toggle } from '../common/Toggle'
import { TokenBadge, DifficultyBadge, TagBadge } from '../common/Badge'
import { useToolStore } from '../../store/toolStore'
import { CATEGORIES } from '../../data/tools'
import type { Tool } from '../../types'

interface ToolModalProps {
  tool: Tool | null
  onClose: () => void
}

export function ToolModal({ tool, onClose }: ToolModalProps) {
  const { toggleTool, pendingChanges } = useToolStore()
  const category = tool ? CATEGORIES.find((c) => c.id === tool.category) : null

  return (
    <AnimatePresence>
      {tool && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-3xl shadow-card-hover flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-border">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `${category?.color}20`, border: `1px solid ${category?.color}40` }}
                  >
                    {category?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                        {category?.name}
                      </span>
                      {tool.isImported && (
                        <span className="badge badge-purple">Importé</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-text">{tool.name}</h2>
                    <p className="text-sm text-text-secondary mt-0.5">{tool.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Toggle
                      checked={tool.isEnabled}
                      onChange={() => toggleTool(tool.id)}
                      disabled={pendingChanges.has(tool.id)}
                    />
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text hover:bg-card-hover transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <TokenBadge impact={tool.tokenImpact} estimate={tool.tokenEstimate} />
                  <DifficultyBadge difficulty={tool.difficulty} />
                  {tool.tags.slice(0, 4).map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto scrollable p-6 space-y-6">
                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={15} className="text-accent" />
                    <h3 className="text-sm font-semibold text-text">Description</h3>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{tool.description}</p>
                </div>

                {/* Config Details */}
                {(tool.config.claudeMd || tool.config.commands || tool.config.settingsJson) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={15} className="text-accent" />
                      <h3 className="text-sm font-semibold text-text">Ce qui est configuré</h3>
                    </div>
                    <div className="space-y-2">
                      {tool.config.claudeMd && (
                        <ConfigItem
                          icon="📄"
                          label="CLAUDE.md"
                          value="Ajoute des instructions globales dans votre CLAUDE.md"
                        />
                      )}
                      {tool.config.commands && (
                        <ConfigItem
                          icon="⚡"
                          label={`Commandes (${tool.config.commands.length})`}
                          value={tool.config.commands.map((c) => `/${c.name}`).join(', ')}
                        />
                      )}
                      {tool.config.settingsJson && (
                        <ConfigItem
                          icon="⚙️"
                          label="settings.json"
                          value="Modifie la configuration Claude Code globale"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* CLAUDE.md Preview */}
                {tool.config.claudeMd && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Code2 size={15} className="text-purple" />
                      <h3 className="text-sm font-semibold text-text">Instructions ajoutées au CLAUDE.md</h3>
                    </div>
                    <pre className="bg-surface border border-border rounded-xl p-4 text-xs text-text-secondary font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {tool.config.claudeMd}
                    </pre>
                  </div>
                )}

                {/* Command Preview */}
                {tool.config.commands && tool.config.commands.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Code2 size={15} className="text-cyan" />
                      <h3 className="text-sm font-semibold text-text">Commandes slash créées</h3>
                    </div>
                    {tool.config.commands.map((cmd) => (
                      <div key={cmd.name} className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="px-2 py-0.5 bg-accent-dim text-accent text-xs rounded-lg font-mono font-semibold">
                            /{cmd.name}
                          </code>
                        </div>
                        <pre className="bg-surface border border-border rounded-xl p-3 text-xs text-text-secondary font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                          {cmd.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tips */}
                {tool.tips.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={15} className="text-yellow" />
                      <h3 className="text-sm font-semibold text-text">Conseils d'utilisation</h3>
                    </div>
                    <ul className="space-y-2">
                      {tool.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-yellow-dim text-yellow text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            {i + 1}
                          </span>
                          <span className="text-sm text-text-secondary leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={tool.isEnabled ? 'dot-enabled' : 'dot-disabled'} />
                  <span className="text-xs text-text-secondary">
                    {tool.isEnabled ? 'Actif — appliqué à Claude Code' : 'Inactif'}
                  </span>
                </div>
                <button
                  onClick={() => toggleTool(tool.id)}
                  disabled={pendingChanges.has(tool.id)}
                  className={tool.isEnabled ? 'btn-secondary' : 'btn-primary'}
                >
                  {pendingChanges.has(tool.id)
                    ? 'En cours...'
                    : tool.isEnabled
                      ? 'Désactiver'
                      : 'Activer cet outil'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ConfigItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 bg-surface border border-border rounded-xl">
      <span className="text-sm">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-text">{label}</div>
        <div className="text-xs text-text-secondary mt-0.5 truncate">{value}</div>
      </div>
    </div>
  )
}

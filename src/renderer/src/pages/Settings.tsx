import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, FolderOpen, FileText, Github, Heart } from 'lucide-react'
import { useToolStore } from '../store/toolStore'

const api = window.electronAPI

export function Settings() {
  const { claudeInfo, detectClaude, tools, toggleTool, addToast } = useToolStore()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-text">Paramètres</h2>
        <p className="text-sm text-text-secondary mt-1">Configuration et informations</p>
      </div>

      {/* Claude Code paths */}
      <Section title="Chemins Claude Code" icon="📁">
        {claudeInfo?.viaWsl && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-purple-dim border border-purple/30 rounded-xl">
            <span className="text-sm">🐧</span>
            <div>
              <div className="text-xs font-semibold text-purple">Claude Code via WSL ({claudeInfo.wslDistro})</div>
              <div className="text-xs text-text-secondary mt-0.5">Les fichiers sont lus/écrits dans le filesystem WSL via \\wsl$\</div>
            </div>
          </div>
        )}
        <SettingRow
          label="settings.json"
          value={claudeInfo?.settingsPath || 'Non détecté'}
          action={
            claudeInfo?.found ? (
              <button
                onClick={() => api.openSettingsFile()}
                className="btn-ghost flex items-center gap-1.5 text-xs"
              >
                <FolderOpen size={13} />
                Ouvrir
              </button>
            ) : null
          }
        />
        <SettingRow
          label="CLAUDE.md global"
          value={claudeInfo?.globalClaudeMdPath || '~/CLAUDE.md'}
          action={
            claudeInfo?.found ? (
              <button
                onClick={() => api.openClaudeMd()}
                className="btn-ghost flex items-center gap-1.5 text-xs"
              >
                <FileText size={13} />
                Éditer
              </button>
            ) : null
          }
        />
        <SettingRow
          label="Plateforme"
          value={claudeInfo?.platform || 'Inconnu'}
        />
        <SettingRow
          label="Version Claude Code"
          value={claudeInfo?.version || 'Non détecté'}
          action={
            <button
              onClick={detectClaude}
              className="btn-ghost text-xs"
            >
              Rafraîchir
            </button>
          }
        />
      </Section>

      {/* Format d'outil personnalisé */}
      <Section title="Importer un outil personnalisé" icon="📦">
        <div className="space-y-3">
          <p className="text-sm text-text-secondary leading-relaxed">
            Importez des outils JSON personnalisés. Le fichier doit respecter le format suivant:
          </p>
          <pre className="bg-surface border border-border rounded-xl p-4 text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre">
{`{
  "id": "mon-outil-unique",
  "name": "Mon Outil",
  "shortDescription": "Description courte",
  "description": "Description longue...",
  "category": "superpowers",
  "tags": ["tag1", "tag2"],
  "tokenImpact": "saves",
  "tokenEstimate": "-20%",
  "difficulty": "easy",
  "config": {
    "claudeMd": "## Instructions\\n\\nContenu..."
  },
  "tips": ["Conseil 1", "Conseil 2"],
  "isEnabled": false,
  "isImported": true
}`}
          </pre>
          <p className="text-xs text-text-muted">
            Categories disponibles: superpowers, frontend, code-review, security, seo, responsive, memory, tokens
          </p>
        </div>
      </Section>

      {/* À propos */}
      <Section title="À propos" icon="ℹ️">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-semibold text-text">Claude Tools Manager</div>
              <div className="text-xs text-text-secondary">Version 1.1.0 — Open Source</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="dot-enabled" />
              <span className="text-xs text-green font-medium">À jour</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <ActionButton
              icon={<Github size={14} />}
              label="Code source sur GitHub"
              onClick={() => api.openExternal('https://github.com/Perlace/ClaudeToolsManager')}
            />
            <ActionButton
              icon={<ExternalLink size={14} />}
              label="Documentation Claude Code"
              onClick={() => api.openExternal('https://docs.anthropic.com/claude/docs/claude-code')}
            />
            <ActionButton
              icon={<Heart size={14} />}
              label="creebs.fr — Support CurePress"
              onClick={() => api.openExternal('https://creebs.fr')}
            />
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Zone de réinitialisation" icon="⚠️">
        <p className="text-sm text-text-secondary mb-3">
          Désactive tous les outils actifs et nettoie les modifications dans settings.json et CLAUDE.md.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="btn-secondary border-red/30 text-red hover:bg-red-dim text-sm"
          >
            Réinitialiser tous les outils
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const enabledTools = tools.filter((t) => t.isEnabled)
                for (const tool of enabledTools) {
                  await toggleTool(tool.id)
                }
                addToast({ type: 'success', title: 'Réinitialisation effectuée', message: `${enabledTools.length} outil(s) désactivé(s).` })
                setConfirmReset(false)
              }}
              className="btn-secondary border-red/30 text-red hover:bg-red-dim text-sm"
            >
              Confirmer la réinitialisation
            </button>
            <button onClick={() => setConfirmReset(false)} className="btn-ghost text-sm">
              Annuler
            </button>
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <span>{icon}</span>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function SettingRow({
  label,
  value,
  action,
}: {
  label: string
  value: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <div className="text-xs font-medium text-text-secondary">{label}</div>
        <div className="text-xs text-text-muted font-mono mt-0.5 truncate max-w-xs">{value}</div>
      </div>
      {action && <div className="shrink-0 ml-3">{action}</div>}
    </div>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:bg-card-hover hover:border-border-light transition-all text-left w-full"
    >
      <span className="text-text-secondary">{icon}</span>
      <span className="text-sm text-text-secondary">{label}</span>
      <ExternalLink size={11} className="text-text-dim ml-auto" />
    </button>
  )
}

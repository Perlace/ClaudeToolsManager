import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, RefreshCw, Upload, Minus, Square, X, CheckCircle, AlertCircle, Info, AlertTriangle, Sun, Moon, FileCode, ChevronDown, User, Zap } from 'lucide-react'
import { useToolStore } from '../store/toolStore'
import { ClaudeMdModal } from './ClaudeMdModal'
import type { ToastMessage, Profile } from '../types'

const api = window.electronAPI

const PROFILE_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  cyan: 'bg-cyan-500',
}

function ProfileSelector() {
  const { profiles, activeProfileId, detectedProfileId, switchProfile } = useToolStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = profiles.find((p) => p.id === activeProfileId)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!profiles.length) return null

  return (
    <div ref={ref} className="relative no-drag">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:bg-card transition-all text-xs"
        title="Changer de profil"
      >
        <div className={`w-2 h-2 rounded-full ${PROFILE_COLORS[active?.color || 'blue'] || 'bg-blue-500'}`} />
        <span className="text-text-secondary font-medium">{active?.name || 'Profil'}</span>
        {detectedProfileId && detectedProfileId === activeProfileId && (
          <Zap size={10} className="text-yellow-400" title="Détecté automatiquement" />
        )}
        <ChevronDown size={11} className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full right-0 mt-1 w-48 bg-card border border-border rounded-2xl shadow-card-hover z-50 overflow-hidden py-1"
          >
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => { switchProfile(p.id); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-surface transition-all ${p.id === activeProfileId ? 'text-text font-semibold' : 'text-text-secondary'}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${PROFILE_COLORS[p.color] || 'bg-blue-500'}`} />
                <span className="flex-1 text-left">{p.name}</span>
                {detectedProfileId === p.id && (
                  <Zap size={10} className="text-yellow-400 shrink-0" title="Session active détectée" />
                )}
                {p.id === activeProfileId && (
                  <CheckCircle size={11} className="text-green shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Header() {
  const { searchQuery, setSearchQuery, importTool, reloadSessions, toasts, removeToast, claudeInfo, detectClaude, isLoading, theme, toggleTheme } = useToolStore()
  const [claudeMdOpen, setClaudeMdOpen] = useState(false)

  return (
    <>
      {/* Titlebar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm shrink-0 titlebar-drag">
        {/* Window controls - macOS */}
        {api.platform === 'darwin' ? (
          <div className="w-16 shrink-0 no-drag" />
        ) : (
          <div className="hidden" />
        )}

        {/* Search */}
        <div className="flex-1 max-w-md no-drag">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher un outil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto no-drag">
          {/* Claude status */}
          <button
            onClick={detectClaude}
            disabled={isLoading}
            title="Rafraîchir la détection Claude Code"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:bg-card transition-all text-xs"
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={isLoading ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  claudeInfo?.found
                    ? 'bg-green shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse'
                    : 'bg-red-400'
                }`}
              />
            </motion.div>
            <span className="text-text-secondary">
              {claudeInfo?.found
                ? `Claude ${claudeInfo.version || 'Code'}${claudeInfo.viaWsl ? ` · WSL` : ''}`
                : 'Non détecté'}
            </span>
          </button>

          {/* Profile selector */}
          <ProfileSelector />

          {/* CLAUDE.md viewer */}
          <button
            onClick={() => setClaudeMdOpen(true)}
            className="btn-secondary flex items-center gap-1.5 h-8 px-3 text-xs"
            title="Voir le contenu du CLAUDE.md global"
          >
            <FileCode size={13} />
            <span>CLAUDE.md</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-text-muted hover:bg-card hover:text-text transition-all"
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Import */}
          <button
            onClick={importTool}
            className="btn-secondary flex items-center gap-1.5 h-8 px-3 text-xs"
            title="Importer un outil personnalisé"
          >
            <Upload size={13} />
            <span>Importer</span>
          </button>

          {/* New session */}
          <button
            onClick={reloadSessions}
            className="btn-primary flex items-center gap-1.5 h-8 px-3 text-xs"
            title="Ouvrir une nouvelle session Claude Code avec les outils actifs"
          >
            <RefreshCw size={13} />
            <span>Nouvelle session</span>
          </button>

          {/* Window controls - Windows/Linux */}
          {api.platform !== 'darwin' && (
            <div className="flex items-center gap-1 ml-2">
              <WinBtn icon={<Minus size={12} />} onClick={() => api.minimizeWindow()} />
              <WinBtn icon={<Square size={10} />} onClick={() => api.maximizeWindow()} />
              <WinBtn icon={<X size={12} />} onClick={() => api.closeWindow()} danger />
            </div>
          )}
        </div>
      </header>

      {/* CLAUDE.md modal */}
      <ClaudeMdModal open={claudeMdOpen} onClose={() => setClaudeMdOpen(false)} />

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

function WinBtn({
  icon,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-text-muted
        ${danger ? 'hover:bg-red/20 hover:text-red' : 'hover:bg-card hover:text-text'}`}
    >
      {icon}
    </button>
  )
}

function Toast({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle size={15} className="text-green shrink-0" />,
    error: <AlertCircle size={15} className="text-red shrink-0" />,
    info: <Info size={15} className="text-cyan shrink-0" />,
    warning: <AlertTriangle size={15} className="text-yellow shrink-0" />,
  }
  const borders = {
    success: 'border-green/30',
    error: 'border-red/30',
    info: 'border-cyan/30',
    warning: 'border-yellow/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 bg-card border ${borders[toast.type]} rounded-2xl shadow-card-hover max-w-xs`}
      onClick={() => onRemove(toast.id)}
    >
      {icons[toast.type]}
      <div className="min-w-0">
        <div className="text-sm font-semibold text-text">{toast.title}</div>
        {toast.message && (
          <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">{toast.message}</div>
        )}
      </div>
    </motion.div>
  )
}

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileCode, ExternalLink, Copy, Check } from 'lucide-react'

const api = window.electronAPI

interface Props {
  open: boolean
  onClose: () => void
}

export function ClaudeMdModal({ open, onClose }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.readClaudeMd().then((res) => {
      setContent(res.success ? res.content : '# CLAUDE.md introuvable\n\nAucun fichier CLAUDE.md global détecté.')
      setLoading(false)
    })
  }, [open])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed inset-4 z-50 flex flex-col bg-card border border-border rounded-2xl shadow-card-hover overflow-hidden"
            style={{ maxWidth: 860, maxHeight: 640, margin: 'auto' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
              <FileCode size={16} className="text-accent" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text">CLAUDE.md global</div>
                <div className="text-xs text-text-muted truncate">Prompt système injecté dans chaque session Claude Code</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!content}
                  className="btn-ghost flex items-center gap-1.5 text-xs h-8 px-3"
                  title="Copier le contenu"
                >
                  {copied ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
                <button
                  onClick={() => api.openClaudeMd()}
                  className="btn-ghost flex items-center gap-1.5 text-xs h-8 px-3"
                  title="Ouvrir dans l'éditeur"
                >
                  <ExternalLink size={13} />
                  Éditer
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-card-hover hover:text-text transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 scrollable">
              {loading ? (
                <div className="flex items-center justify-center h-32 text-text-muted text-sm">
                  Chargement...
                </div>
              ) : (
                <pre className="text-xs font-mono text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
                  {content || 'Fichier vide.'}
                </pre>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

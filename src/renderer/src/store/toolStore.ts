import { create } from 'zustand'
import { TOOLS, CATEGORIES } from '../data/tools'
import type { Tool, Category, ClaudeInstallation, ToastMessage } from '../types'

interface ToolStore {
  tools: Tool[]
  categories: Category[]
  activeCategory: string
  searchQuery: string
  claudeInfo: ClaudeInstallation | null
  toasts: ToastMessage[]
  isLoading: boolean
  pendingChanges: Set<string>

  setActiveCategory: (id: string) => void
  setSearchQuery: (q: string) => void
  setClaudeInfo: (info: ClaudeInstallation) => void
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  toggleTool: (toolId: string) => Promise<void>
  loadEnabledTools: () => Promise<void>
  loadCustomTools: () => Promise<void>
  importTool: () => Promise<void>
  reloadSessions: () => Promise<void>
  detectClaude: () => Promise<void>

  getFilteredTools: () => Tool[]
  getToolsByCategory: (categoryId: string) => Tool[]
  getEnabledCount: () => number
  getTokenSavings: () => number
}

const api = window.electronAPI

export const useToolStore = create<ToolStore>((set, get) => ({
  tools: TOOLS.map((t) => ({ ...t, isEnabled: false })),
  categories: CATEGORIES,
  activeCategory: 'all',
  searchQuery: '',
  claudeInfo: null,
  toasts: [],
  isLoading: false,
  pendingChanges: new Set(),

  setActiveCategory: (id) => set({ activeCategory: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setClaudeInfo: (info) => set({ claudeInfo: info }),

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => get().removeToast(id), 4000)
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toggleTool: async (toolId) => {
    const { tools, claudeInfo, pendingChanges } = get()
    if (pendingChanges.has(toolId)) return

    const tool = tools.find((t) => t.id === toolId)
    if (!tool) return

    if (!claudeInfo?.found) {
      get().addToast({
        type: 'error',
        title: 'Claude Code introuvable',
        message: 'Installez Claude Code avant d\'activer des outils.',
      })
      return
    }

    const newEnabled = !tool.isEnabled
    set((s) => ({
      pendingChanges: new Set([...s.pendingChanges, toolId]),
      tools: s.tools.map((t) => (t.id === toolId ? { ...t, isEnabled: newEnabled } : t)),
    }))

    try {
      const result = await api.toggleTool({ ...tool, isEnabled: newEnabled }, newEnabled)
      if (!result.success) {
        set((s) => ({
          tools: s.tools.map((t) => (t.id === toolId ? { ...t, isEnabled: !newEnabled } : t)),
        }))
        get().addToast({
          type: 'error',
          title: 'Erreur',
          message: result.error || 'Impossible de modifier l\'outil.',
        })
      } else {
        get().addToast({
          type: 'success',
          title: newEnabled ? `${tool.name} activé` : `${tool.name} désactivé`,
          message: newEnabled
            ? 'Rechargez la session pour appliquer.'
            : 'Modification appliquée.',
        })
      }
    } catch (err) {
      set((s) => ({
        tools: s.tools.map((t) => (t.id === toolId ? { ...t, isEnabled: !newEnabled } : t)),
      }))
      get().addToast({ type: 'error', title: 'Erreur réseau', message: String(err) })
    } finally {
      set((s) => {
        const next = new Set(s.pendingChanges)
        next.delete(toolId)
        return { pendingChanges: next }
      })
    }
  },

  loadEnabledTools: async () => {
    try {
      const enabledIds = await api.getEnabledTools()
      set((s) => ({
        tools: s.tools.map((t) => ({ ...t, isEnabled: enabledIds.includes(t.id) })),
      }))
    } catch {
      // silently fail
    }
  },

  loadCustomTools: async () => {
    try {
      const custom = await api.getCustomTools()
      if (custom.length > 0) {
        set((s) => {
          const existingIds = new Set(s.tools.map((t) => t.id))
          const newTools = custom.filter((t) => !existingIds.has(t.id))
          return { tools: [...s.tools, ...newTools] }
        })
      }
    } catch {
      // silently fail
    }
  },

  importTool: async () => {
    try {
      const result = await api.importToolFile()
      if (!result) return
      if (!result.success || !result.tool) {
        get().addToast({ type: 'error', title: 'Import échoué', message: result.error })
        return
      }
      set((s) => {
        const exists = s.tools.find((t) => t.id === result.tool!.id)
        if (exists) {
          return { tools: s.tools.map((t) => (t.id === result.tool!.id ? result.tool! : t)) }
        }
        return { tools: [...s.tools, result.tool!] }
      })
      get().addToast({
        type: 'success',
        title: `"${result.tool.name}" importé`,
        message: 'L\'outil est disponible dans sa catégorie.',
      })
    } catch (err) {
      get().addToast({ type: 'error', title: 'Erreur import', message: String(err) })
    }
  },

  reloadSessions: async () => {
    try {
      const result = await api.reloadSessions()
      get().addToast({
        type: result.success ? 'success' : 'warning',
        title: result.success ? 'Sessions rechargées' : 'Rechargement partiel',
        message: result.message,
      })
    } catch (err) {
      get().addToast({ type: 'error', title: 'Erreur reload', message: String(err) })
    }
  },

  detectClaude: async () => {
    set({ isLoading: true })
    try {
      const info = await api.detectClaude()
      set({ claudeInfo: info })
    } catch {
      set({ claudeInfo: null })
    } finally {
      set({ isLoading: false })
    }
  },

  getFilteredTools: () => {
    const { tools, activeCategory, searchQuery } = get()
    return tools.filter((t) => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
      return matchCat && matchSearch
    })
  },

  getToolsByCategory: (categoryId) => {
    return get().tools.filter((t) => t.category === categoryId)
  },

  getEnabledCount: () => get().tools.filter((t) => t.isEnabled).length,

  getTokenSavings: () => {
    const enabled = get().tools.filter((t) => t.isEnabled)
    let total = 0
    for (const tool of enabled) {
      const match = tool.tokenEstimate.match(/([-+]?\d+)%/)
      if (match) {
        const val = parseInt(match[1])
        total += val
      }
    }
    return total
  },
}))

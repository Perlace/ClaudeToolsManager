import { create } from 'zustand'
import { TOOLS, CATEGORIES } from '../data/tools'
import type { Tool, Category, ClaudeInstallation, ToastMessage, Profile } from '../types'

interface ToolStore {
  tools: Tool[]
  categories: Category[]
  activeCategory: string
  searchQuery: string
  claudeInfo: ClaudeInstallation | null
  toasts: ToastMessage[]
  isLoading: boolean
  pendingChanges: Set<string>
  theme: 'dark' | 'light'

  // Profiles
  profiles: Profile[]
  activeProfileId: string
  detectedProfileId: string | null

  // Category state
  toolCatOverrides: Record<string, string>
  userCategories: Category[]
  catCustomizations: Record<string, Partial<Category>>
  categoryOrder: string[]

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
  toggleTheme: () => void

  // Profile actions
  loadProfiles: () => Promise<void>
  switchProfile: (id: string, manual?: boolean) => Promise<void>
  saveProfile: (profile: Profile) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  autoDetectProfile: () => Promise<void>

  // Category actions
  loadCategoryData: () => Promise<void>
  moveToolToCategory: (toolId: string, categoryId: string) => Promise<void>
  addUserCategory: (cat: Omit<Category, 'id'>) => Promise<void>
  updateCategoryCustom: (id: string, patch: Partial<Category>) => Promise<void>
  deleteUserCategory: (id: string) => Promise<void>
  saveCategoryOrder: (orderedIds: string[]) => Promise<void>

  // Computed
  getAllCategories: () => Category[]
  getEffectiveCategoryId: (toolId: string, defaultCatId: string) => string
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
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',

  // Profiles
  profiles: [],
  activeProfileId: 'perso',
  detectedProfileId: null,

  // Category state
  toolCatOverrides: {},
  userCategories: [],
  catCustomizations: {},
  categoryOrder: [],

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
      const result = await api.toggleTool({ ...tool, isEnabled: newEnabled }, newEnabled, get().activeProfileId)
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
      const { activeProfileId } = get()
      const enabledIds = await api.getEnabledTools(activeProfileId)
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
        type: result.success ? (result.method === 'notify' ? 'info' : 'success') : 'warning',
        title: result.method === 'live-reload'
          ? 'Nouvelle session ouverte'
          : result.success
            ? 'Outils sauvegardés'
            : 'Action requise',
        message: result.message,
      })
    } catch (err) {
      get().addToast({ type: 'error', title: 'Erreur', message: String(err) })
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

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    set({ theme: next })
  },

  // ─── Profile actions ─────────────────────────────────────────────────────────

  loadProfiles: async () => {
    try {
      const [profiles, activeProfileId] = await Promise.all([
        api.getProfiles(),
        api.getActiveProfileId(),
      ])
      set({ profiles, activeProfileId })
    } catch {
      // silently fail
    }
  },

  switchProfile: async (id, manual = true) => {
    try {
      if (manual) await api.setActiveProfileId(id)
      set({ activeProfileId: id })
      const enabledIds = await api.getEnabledTools(id)
      set((s) => ({
        tools: s.tools.map((t) => ({ ...t, isEnabled: enabledIds.includes(t.id) })),
      }))
      const profile = get().profiles.find((p) => p.id === id)
      get().addToast({
        type: 'info',
        title: `Profil "${profile?.name || id}"`,
        message: 'Outils rechargés pour ce profil.',
      })
    } catch (err) {
      get().addToast({ type: 'error', title: 'Erreur profil', message: String(err) })
    }
  },

  saveProfile: async (profile) => {
    const profiles = get().profiles
    const idx = profiles.findIndex((p) => p.id === profile.id)
    const updated = idx >= 0
      ? profiles.map((p, i) => (i === idx ? profile : p))
      : [...profiles, profile]
    set({ profiles: updated })
    await api.saveProfiles(updated)
  },

  deleteProfile: async (id) => {
    const profiles = get().profiles.filter((p) => p.id !== id)
    set({ profiles })
    await api.saveProfiles(profiles)
    if (get().activeProfileId === id && profiles.length > 0) {
      await get().switchProfile(profiles[0].id)
    }
  },

  autoDetectProfile: async () => {
    try {
      const detected = await api.detectActiveProfile()
      set({ detectedProfileId: detected })
      if (detected && detected !== get().activeProfileId) {
        await get().switchProfile(detected, false)
      }
    } catch { /* silently fail */ }
  },

  // ─── Category actions ───────────────────────────────────────────────────────

  loadCategoryData: async () => {
    try {
      const [overrides, userCats, customRaw] = await Promise.all([
        api.getToolCatOverrides(),
        api.getUserCategories(),
        api.getCatCustomizations(),
      ])
      const { _order, ...customs } = customRaw as Record<string, Partial<Category> | string[]>
      const categoryOrder = Array.isArray(_order) ? (_order as string[]) : []
      set({
        toolCatOverrides: overrides,
        userCategories: userCats as Category[],
        catCustomizations: customs as Record<string, Partial<Category>>,
        categoryOrder,
      })
    } catch {
      // silently fail
    }
  },

  moveToolToCategory: async (toolId, categoryId) => {
    const overrides = { ...get().toolCatOverrides, [toolId]: categoryId }
    set({ toolCatOverrides: overrides })
    try {
      await api.saveToolCatOverrides(overrides)
    } catch {
      // silently fail
    }
  },

  addUserCategory: async (cat) => {
    const id = `user-${Date.now()}`
    const newCat: Category = { ...cat, id }
    const userCategories = [...get().userCategories, newCat]
    set({ userCategories })
    try {
      await api.saveUserCategories(userCategories)
    } catch {
      // silently fail
    }
  },

  updateCategoryCustom: async (id, patch) => {
    const catCustomizations = { ...get().catCustomizations, [id]: { ...get().catCustomizations[id], ...patch } }
    set({ catCustomizations })
    try {
      const { categoryOrder } = get()
      const data: Record<string, Partial<Category> | string[]> = { ...catCustomizations, _order: categoryOrder }
      await api.saveCatCustomizations(data)
    } catch {
      // silently fail
    }
  },

  deleteUserCategory: async (id) => {
    const userCategories = get().userCategories.filter((c) => c.id !== id)
    // Revert any tool overrides pointing to this category
    const overrides = { ...get().toolCatOverrides }
    for (const toolId of Object.keys(overrides)) {
      if (overrides[toolId] === id) {
        delete overrides[toolId]
      }
    }
    set({ userCategories, toolCatOverrides: overrides })
    try {
      await Promise.all([
        api.saveUserCategories(userCategories),
        api.saveToolCatOverrides(overrides),
      ])
    } catch {
      // silently fail
    }
  },

  saveCategoryOrder: async (orderedIds) => {
    set({ categoryOrder: orderedIds })
    try {
      const { catCustomizations } = get()
      const data: Record<string, Partial<Category> | string[]> = { ...catCustomizations, _order: orderedIds }
      await api.saveCatCustomizations(data)
    } catch {
      // silently fail
    }
  },

  // ─── Computed ───────────────────────────────────────────────────────────────

  getAllCategories: () => {
    const { catCustomizations, userCategories, categoryOrder } = get()
    // Apply customizations to built-in categories
    const builtIn: Category[] = CATEGORIES.map((c) => {
      const custom = catCustomizations[c.id]
      if (!custom) return c
      return { ...c, ...custom }
    })
    const all = [...builtIn, ...userCategories]
    if (categoryOrder.length === 0) return all
    // Sort by order
    const orderMap = new Map(categoryOrder.map((id, i) => [id, i]))
    return [...all].sort((a, b) => {
      const ia = orderMap.has(a.id) ? orderMap.get(a.id)! : Infinity
      const ib = orderMap.has(b.id) ? orderMap.get(b.id)! : Infinity
      return ia - ib
    })
  },

  getEffectiveCategoryId: (toolId, defaultCatId) => {
    return get().toolCatOverrides[toolId] || defaultCatId
  },

  getFilteredTools: () => {
    const { tools, activeCategory, searchQuery } = get()
    return tools.filter((t) => {
      const effectiveCat = get().getEffectiveCategoryId(t.id, t.category)
      const matchCat = activeCategory === 'all' || effectiveCat === activeCategory
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
    return get().tools.filter((t) => get().getEffectiveCategoryId(t.id, t.category) === categoryId)
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

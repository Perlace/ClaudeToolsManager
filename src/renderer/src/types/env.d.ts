import type { Tool, ClaudeInstallation, Category } from './index'

declare global {
  interface Window {
    electronAPI: {
      detectClaude: () => Promise<ClaudeInstallation>
      getEnabledTools: () => Promise<string[]>
      toggleTool: (tool: Tool, enabled: boolean) => Promise<{ success: boolean; error?: string }>
      reloadSessions: () => Promise<{ success: boolean; method: string; message: string }>
      isClaudeRunning: () => Promise<boolean>
      getCustomTools: () => Promise<Tool[]>
      importToolFile: () => Promise<{ success: boolean; tool?: Tool; error?: string } | null>
      openExternal: (url: string) => Promise<void>
      openSettingsFile: () => Promise<void>
      openClaudeMd: () => Promise<void>
      readClaudeMd: () => Promise<{ success: boolean; content: string }>
      getToolCatOverrides: () => Promise<Record<string, string>>
      saveToolCatOverrides: (data: Record<string, string>) => Promise<{ success: boolean }>
      getUserCategories: () => Promise<Category[]>
      saveUserCategories: (data: Category[]) => Promise<{ success: boolean }>
      getCatCustomizations: () => Promise<Record<string, Partial<Category>>>
      saveCatCustomizations: (data: Record<string, Partial<Category> | string[]>) => Promise<{ success: boolean }>
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      platform: string
    }
  }
}

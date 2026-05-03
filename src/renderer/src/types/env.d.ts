import type { Tool, ClaudeInstallation } from './index'

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
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      platform: string
    }
  }
}

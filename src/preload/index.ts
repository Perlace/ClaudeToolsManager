import { contextBridge, ipcRenderer } from 'electron'
import type { Tool, ClaudeInstallation } from '../types/shared'

const api = {
  detectClaude: (): Promise<ClaudeInstallation> => ipcRenderer.invoke('detect-claude'),
  getEnabledTools: (): Promise<string[]> => ipcRenderer.invoke('get-enabled-tools'),
  toggleTool: (tool: Tool, enabled: boolean): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('toggle-tool', tool, enabled),
  reloadSessions: (): Promise<{ success: boolean; method: string; message: string }> =>
    ipcRenderer.invoke('reload-sessions'),
  isClaudeRunning: (): Promise<boolean> => ipcRenderer.invoke('is-claude-running'),
  getCustomTools: (): Promise<Tool[]> => ipcRenderer.invoke('get-custom-tools'),
  importToolFile: (): Promise<{ success: boolean; tool?: Tool; error?: string } | null> =>
    ipcRenderer.invoke('import-tool-file'),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('open-external', url),
  openSettingsFile: (): Promise<void> => ipcRenderer.invoke('open-settings-file'),
  openClaudeMd: (): Promise<void> => ipcRenderer.invoke('open-claude-md'),
  readClaudeMd: (): Promise<{ success: boolean; content: string }> => ipcRenderer.invoke('read-claude-md'),

  getToolCatOverrides: (): Promise<Record<string, string>> => ipcRenderer.invoke('get-tool-cat-overrides'),
  saveToolCatOverrides: (data: Record<string, string>): Promise<{ success: boolean }> => ipcRenderer.invoke('save-tool-cat-overrides', data),
  getUserCategories: (): Promise<unknown[]> => ipcRenderer.invoke('get-user-categories'),
  saveUserCategories: (data: unknown[]): Promise<{ success: boolean }> => ipcRenderer.invoke('save-user-categories', data),
  getCatCustomizations: (): Promise<Record<string, unknown>> => ipcRenderer.invoke('get-cat-customizations'),
  saveCatCustomizations: (data: Record<string, unknown>): Promise<{ success: boolean }> => ipcRenderer.invoke('save-cat-customizations', data),

  minimizeWindow: (): void => ipcRenderer.send('minimize-window'),
  maximizeWindow: (): void => ipcRenderer.send('maximize-window'),
  closeWindow: (): void => ipcRenderer.send('close-window'),

  platform: process.platform,
}

contextBridge.exposeInMainWorld('electronAPI', api)

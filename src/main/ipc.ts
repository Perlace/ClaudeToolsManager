import { ipcMain, shell, dialog, app } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { detectClaudeInstallation } from './services/claudeDetector'
import { enableTool, disableTool, getEnabledTools, getCustomTools, saveCustomTool } from './services/toolManager'
import { reloadClaudeSessions, isClaudeRunning } from './services/sessionManager'
import {
  getProfiles, saveProfiles, getProfileById,
  resolveActiveProfileId, setManualActiveProfileId,
  detectActiveProfileFromProcess, applyProfilePermissions,
} from './services/profileManager'
import { createProfileWindow } from './index'
import type { Tool, Profile } from '../types/shared'

let claudeInfo = detectClaudeInstallation()

export function setupIPC(): void {
  ipcMain.handle('detect-claude', () => {
    claudeInfo = detectClaudeInstallation()
    return claudeInfo
  })

  ipcMain.handle('get-enabled-tools', (_event, profileId?: string) => {
    const id = profileId || resolveActiveProfileId(getProfiles())
    return getEnabledTools(id)
  })

  ipcMain.handle('toggle-tool', async (_event, tool: Tool, enabled: boolean, profileId?: string) => {
    try {
      const id = profileId || resolveActiveProfileId(getProfiles())
      const profile = getProfileById(id)
      if (!profile) return { success: false, error: `Profil "${id}" introuvable` }
      if (enabled) {
        enableTool(tool, profile)
      } else {
        disableTool(tool, profile)
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // ─── Profile handlers ────────────────────────────────────────────────────────

  ipcMain.handle('get-profiles', () => {
    return getProfiles()
  })

  ipcMain.handle('save-profiles', (_event, profiles: Profile[]) => {
    saveProfiles(profiles)
    for (const profile of profiles) applyProfilePermissions(profile)
    return { success: true }
  })

  ipcMain.handle('get-active-profile-id', () => {
    const profiles = getProfiles()
    return resolveActiveProfileId(profiles)
  })

  ipcMain.handle('set-active-profile-id', (_event, id: string | null) => {
    setManualActiveProfileId(id)
    return { success: true }
  })

  ipcMain.handle('detect-active-profile', () => {
    const profiles = getProfiles()
    return detectActiveProfileFromProcess(profiles)
  })

  ipcMain.handle('open-profile-window', (_event, profileId: string) => {
    try {
      createProfileWindow(profileId)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('reload-sessions', () => {
    return reloadClaudeSessions(claudeInfo.cliPath, claudeInfo.viaWsl)
  })

  ipcMain.handle('is-claude-running', () => {
    return isClaudeRunning()
  })

  ipcMain.handle('get-custom-tools', () => {
    return getCustomTools()
  })

  ipcMain.handle('import-tool-file', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Importer un outil',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (result.canceled || result.filePaths.length === 0) return null
    try {
      const content = readFileSync(result.filePaths[0], 'utf8')
      const tool: Tool = JSON.parse(content)
      tool.isImported = true
      tool.isEnabled = false
      saveCustomTool(tool)
      return { success: true, tool }
    } catch (err) {
      return { success: false, error: 'Fichier JSON invalide: ' + String(err) }
    }
  })

  ipcMain.handle('open-external', (_event, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('open-settings-file', () => {
    shell.showItemInFolder(claudeInfo.settingsPath)
  })

  ipcMain.handle('open-claude-md', () => {
    shell.openPath(claudeInfo.globalClaudeMdPath)
  })

  ipcMain.handle('read-claude-md', () => {
    try {
      const content = readFileSync(claudeInfo.globalClaudeMdPath, 'utf8')
      return { success: true, content }
    } catch {
      return { success: false, content: '' }
    }
  })

  // ─── Category data stores ───────────────────────────────────────────────────

  const userData = app.getPath('userData')

  const catOverridesPath = join(userData, 'tool-category-overrides.json')
  const userCatsPath = join(userData, 'user-categories.json')
  const catCustomPath = join(userData, 'category-customizations.json')

  function readJSON<T>(filePath: string, fallback: T): T {
    try {
      if (!existsSync(filePath)) return fallback
      return JSON.parse(readFileSync(filePath, 'utf8')) as T
    } catch {
      return fallback
    }
  }

  function writeJSON(filePath: string, data: unknown): void {
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  }

  ipcMain.handle('get-tool-cat-overrides', () => {
    return readJSON<Record<string, string>>(catOverridesPath, {})
  })

  ipcMain.handle('save-tool-cat-overrides', (_event, data: Record<string, string>) => {
    writeJSON(catOverridesPath, data)
    return { success: true }
  })

  ipcMain.handle('get-user-categories', () => {
    return readJSON<unknown[]>(userCatsPath, [])
  })

  ipcMain.handle('save-user-categories', (_event, data: unknown[]) => {
    writeJSON(userCatsPath, data)
    return { success: true }
  })

  ipcMain.handle('get-cat-customizations', () => {
    return readJSON<Record<string, unknown>>(catCustomPath, {})
  })

  ipcMain.handle('save-cat-customizations', (_event, data: Record<string, unknown>) => {
    writeJSON(catCustomPath, data)
    return { success: true }
  })
}

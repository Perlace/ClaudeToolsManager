import { ipcMain, shell, dialog } from 'electron'
import { readFileSync } from 'fs'
import { detectClaudeInstallation } from './services/claudeDetector'
import { enableTool, disableTool, getEnabledTools, getCustomTools, saveCustomTool } from './services/toolManager'
import { reloadClaudeSessions, isClaudeRunning } from './services/sessionManager'
import type { Tool } from '../types/shared'

let claudeInfo = detectClaudeInstallation()

export function setupIPC(): void {
  ipcMain.handle('detect-claude', () => {
    claudeInfo = detectClaudeInstallation()
    return claudeInfo
  })

  ipcMain.handle('get-enabled-tools', () => {
    return getEnabledTools()
  })

  ipcMain.handle('toggle-tool', async (_event, tool: Tool, enabled: boolean) => {
    try {
      if (enabled) {
        enableTool(tool, claudeInfo.settingsPath, claudeInfo.globalClaudeMdPath)
      } else {
        disableTool(tool, claudeInfo.settingsPath, claudeInfo.globalClaudeMdPath)
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('reload-sessions', () => {
    return reloadClaudeSessions(claudeInfo.cliPath)
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
}

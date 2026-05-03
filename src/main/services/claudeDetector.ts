import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { homedir, platform } from 'os'
import { execSync } from 'child_process'

export interface ClaudeInstallation {
  found: boolean
  version?: string
  cliPath?: string
  settingsPath: string
  globalClaudeMdPath: string
  commandsPath: string
  platform: string
}

function getClaudeSettingsDir(): string {
  const os = platform()
  if (os === 'win32') {
    return join(process.env.APPDATA || homedir(), 'Claude')
  }
  return join(homedir(), '.claude')
}

export function detectClaudeInstallation(): ClaudeInstallation {
  const os = platform()
  const settingsDir = getClaudeSettingsDir()
  const settingsPath = join(settingsDir, 'settings.json')
  const globalClaudeMdPath = join(homedir(), 'CLAUDE.md')
  const commandsPath = join(settingsDir, 'commands')

  let cliPath: string | undefined
  let version: string | undefined

  const cliCandidates =
    os === 'win32'
      ? [
          join(process.env.LOCALAPPDATA || '', 'Programs', 'claude', 'claude.exe'),
          join(process.env.PROGRAMFILES || '', 'claude', 'claude.exe'),
          'claude',
        ]
      : [
          '/usr/local/bin/claude',
          '/usr/bin/claude',
          join(homedir(), '.local', 'bin', 'claude'),
          join(homedir(), '.npm-global', 'bin', 'claude'),
          'claude',
        ]

  for (const candidate of cliCandidates) {
    try {
      const result = execSync(`"${candidate}" --version 2>/dev/null || "${candidate}" -v 2>/dev/null`, {
        timeout: 3000,
        encoding: 'utf8',
        windowsHide: true,
        shell: true,
      }).trim()
      if (result) {
        cliPath = candidate
        version = result.replace(/^claude\s+/i, '').trim()
        break
      }
    } catch {
      // continue
    }
  }

  if (!cliPath) {
    try {
      const result = execSync(os === 'win32' ? 'where claude' : 'which claude', {
        timeout: 3000,
        encoding: 'utf8',
        windowsHide: true,
      }).trim()
      if (result) {
        cliPath = result.split('\n')[0].trim()
      }
    } catch {
      // not found
    }
  }

  return {
    found: !!(cliPath || existsSync(settingsPath)),
    version,
    cliPath,
    settingsPath,
    globalClaudeMdPath,
    commandsPath,
    platform: os,
  }
}

export function readClaudeSettings(settingsPath: string): Record<string, unknown> {
  if (!existsSync(settingsPath)) return {}
  try {
    return JSON.parse(readFileSync(settingsPath, 'utf8'))
  } catch {
    return {}
  }
}

export function writeClaudeSettings(settingsPath: string, settings: Record<string, unknown>): void {
  const dir = settingsPath.replace(/[/\\][^/\\]+$/, '')
  if (!existsSync(dir)) {
    require('fs').mkdirSync(dir, { recursive: true })
  }
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8')
}

export function readGlobalClaudeMd(path: string): string {
  if (!existsSync(path)) return ''
  return readFileSync(path, 'utf8')
}

export function writeGlobalClaudeMd(path: string, content: string): void {
  writeFileSync(path, content, 'utf8')
}

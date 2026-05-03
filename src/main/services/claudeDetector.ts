import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
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
  viaWsl?: boolean
  wslDistro?: string
}

// ─── WSL helpers ────────────────────────────────────────────────────────────

function getWslDistro(): string | null {
  try {
    const raw = execSync('wsl.exe -l -q', { timeout: 4000, encoding: 'utf16le', windowsHide: true })
    // Remove BOM (﻿), null bytes, carriage returns, then split
    const cleaned = raw.replace(/﻿/g, '').replace(/\0/g, '').replace(/\r/g, '')
    const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean)
    // Skip docker-desktop and WSL system distros
    const first = lines
      .map((l) => l.replace(/\s*\(Default\)/i, '').trim())
      .find((l) => l && !/^docker-desktop/i.test(l))
    return first || null
  } catch {
    return null
  }
}

function wslHomeToWinPath(distro: string, wslHome: string): string {
  // /home/perl  →  \\wsl$\Ubuntu\home\perl
  const linuxPath = wslHome.startsWith('/') ? wslHome : `/${wslHome}`
  return `\\\\wsl$\\${distro}${linuxPath.replace(/\//g, '\\')}`
}

function detectWslClaude(): { found: true; version: string; cliPath: string; settingsPath: string; claudeMdPath: string; commandsPath: string; distro: string } | null {
  // Quick check: wsl.exe must be reachable
  try {
    execSync('wsl.exe -e echo ok', { timeout: 4000, windowsHide: true, stdio: 'ignore' })
  } catch {
    return null
  }

  // Get Claude version via WSL — use bash -l for login shell (full PATH)
  let version: string | null = null
  try {
    const v = execSync(
      'wsl.exe -e bash -l -c "claude --version 2>/dev/null || ~/.local/bin/claude --version 2>/dev/null || ~/.npm-global/bin/claude --version 2>/dev/null"',
      { timeout: 8000, encoding: 'utf8', windowsHide: true },
    ).trim()
    // Keep only the first line (avoid extra output from .bashrc)
    const firstLine = v.split('\n')[0].trim()
    if (firstLine) version = firstLine.replace(/^claude\s+/i, '').trim()
  } catch {
    return null
  }

  if (!version) return null

  // Get WSL home dir and distro
  const distro = getWslDistro()
  if (!distro) return null

  let wslHome: string
  try {
    const raw = execSync('wsl.exe -e bash -l -c "echo $HOME"', {
      timeout: 4000,
      encoding: 'utf8',
      windowsHide: true,
    }).trim()
    // Take first line in case .bashrc prints something
    wslHome = raw.split('\n').find((l) => l.startsWith('/')) || `/home/${process.env.USERNAME?.toLowerCase() || 'user'}`
  } catch {
    wslHome = `/home/${process.env.USERNAME?.toLowerCase() || 'user'}`
  }

  const winHome = wslHomeToWinPath(distro, wslHome)
  const settingsPath = join(winHome, '.claude', 'settings.json')
  const claudeMdPath = join(winHome, 'CLAUDE.md')
  const commandsPath = join(winHome, '.claude', 'commands')

  // Find CLI path (absolute path is more reliable than relying on wsl.exe PATH)
  let cliPath = 'wsl.exe -e claude'
  try {
    const raw = execSync(
      'wsl.exe -e bash -l -c "which claude 2>/dev/null || echo ~/.local/bin/claude"',
      { timeout: 4000, encoding: 'utf8', windowsHide: true },
    ).trim()
    const resolved = raw.split('\n').find((l) => l.startsWith('/'))
    if (resolved) cliPath = `wsl.exe -e ${resolved}`
  } catch { /* use default */ }

  return { found: true, version, cliPath, settingsPath, claudeMdPath, commandsPath, distro }
}

// ─── Main detector ───────────────────────────────────────────────────────────

function getWindowsSettingsDir(): string {
  // Windows-native Claude Code stores settings in %APPDATA%\Claude
  return join(process.env.APPDATA || homedir(), 'Claude')
}

export function detectClaudeInstallation(): ClaudeInstallation {
  const os = platform()

  // ── 1. Try WSL detection first (most common on Windows dev machines) ──
  if (os === 'win32') {
    const wsl = detectWslClaude()
    if (wsl) {
      return {
        found: true,
        version: wsl.version,
        cliPath: wsl.cliPath,
        settingsPath: wsl.settingsPath,
        globalClaudeMdPath: wsl.claudeMdPath,
        commandsPath: wsl.commandsPath,
        platform: os,
        viaWsl: true,
        wslDistro: wsl.distro,
      }
    }

    // ── 2. Try native Windows Claude Code ──
    const settingsDir = getWindowsSettingsDir()
    const settingsPath = join(settingsDir, 'settings.json')
    const claudeMdPath = join(homedir(), 'CLAUDE.md')
    const commandsPath = join(settingsDir, 'commands')

    const candidates = [
      join(process.env.LOCALAPPDATA || '', 'Programs', 'claude', 'claude.exe'),
      join(process.env.PROGRAMFILES || '', 'claude', 'claude.exe'),
      join(process.env.APPDATA || '', 'npm', 'claude.cmd'),
      join(process.env.APPDATA || '', 'npm', 'claude'),
      'claude',
    ]

    let cliPath: string | undefined
    let version: string | undefined

    const fullPath = [
      process.env.PATH,
      `${process.env.APPDATA}\\npm`,
      `${process.env.LOCALAPPDATA}\\Programs\\nodejs`,
      'C:\\Program Files\\nodejs',
    ].filter(Boolean).join(';')

    for (const candidate of candidates) {
      try {
        const result = execSync(`"${candidate}" --version`, {
          timeout: 3000, encoding: 'utf8', windowsHide: true,
          env: { ...process.env, PATH: fullPath },
          shell: true,
        }).trim()
        if (result) {
          cliPath = candidate
          version = result.replace(/^claude\s+/i, '').trim()
          break
        }
      } catch { /* continue */ }
    }

    return {
      found: !!(cliPath || existsSync(settingsPath)),
      version,
      cliPath,
      settingsPath,
      globalClaudeMdPath: claudeMdPath,
      commandsPath,
      platform: os,
      viaWsl: false,
    }
  }

  // ── 3. Linux / macOS ──
  const settingsDir = join(homedir(), '.claude')
  const settingsPath = join(settingsDir, 'settings.json')
  const claudeMdPath = join(homedir(), 'CLAUDE.md')
  const commandsPath = join(settingsDir, 'commands')

  const candidates = [
    '/usr/local/bin/claude',
    '/usr/bin/claude',
    join(homedir(), '.local', 'bin', 'claude'),
    join(homedir(), '.npm-global', 'bin', 'claude'),
    'claude',
  ]

  let cliPath: string | undefined
  let version: string | undefined

  for (const candidate of candidates) {
    try {
      const result = execSync(`"${candidate}" --version`, {
        timeout: 3000, encoding: 'utf8', shell: true,
      }).trim()
      if (result) {
        cliPath = candidate
        version = result.replace(/^claude\s+/i, '').trim()
        break
      }
    } catch { /* continue */ }
  }

  if (!cliPath) {
    try {
      const w = execSync('which claude', { timeout: 2000, encoding: 'utf8' }).trim()
      if (w) cliPath = w
    } catch { /* not found */ }
  }

  return {
    found: !!(cliPath || existsSync(settingsPath)),
    version,
    cliPath,
    settingsPath,
    globalClaudeMdPath: claudeMdPath,
    commandsPath,
    platform: platform(),
  }
}

// ─── File helpers ────────────────────────────────────────────────────────────

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
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8')
}

export function readGlobalClaudeMd(path: string): string {
  if (!existsSync(path)) return ''
  return readFileSync(path, 'utf8')
}

export function writeGlobalClaudeMd(path: string, content: string): void {
  const dir = path.replace(/[/\\][^/\\]+$/, '')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(path, content, 'utf8')
}

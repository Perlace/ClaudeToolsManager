import { execSync } from 'child_process'
import { platform } from 'os'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

export interface SessionReloadResult {
  success: boolean
  method: 'live-reload' | 'restart' | 'notify'
  message: string
}

function getWslClaudePids(): number[] {
  try {
    const out = execSync('wsl.exe -e sh -c "pgrep -f \'node.*claude\' 2>/dev/null; pgrep -f \'/claude$\' 2>/dev/null; true"', {
      timeout: 4000, encoding: 'utf8', windowsHide: true,
    })
    return out.trim().split('\n').filter(Boolean).map(Number).filter((n) => !isNaN(n))
  } catch {
    return []
  }
}

function getWinClaudePids(): number[] {
  try {
    const out = execSync('tasklist /FI "IMAGENAME eq claude.exe" /FO CSV', {
      encoding: 'utf8', windowsHide: true,
    })
    const pids: number[] = []
    for (const line of out.split('\n').slice(1)) {
      const match = line.match(/"(\d+)"/)
      if (match) pids.push(parseInt(match[1]))
    }
    return pids
  } catch {
    return []
  }
}

export function isClaudeRunning(): boolean {
  const os = platform()
  if (os === 'win32') {
    return getWinClaudePids().length > 0 || getWslClaudePids().length > 0
  }
  try {
    const out = execSync('pgrep -f "claude" 2>/dev/null || true', {
      encoding: 'utf8', shell: true,
    })
    return out.trim().split('\n').filter(Boolean).length > 0
  } catch {
    return false
  }
}

export function saveContextSnapshot(context: string): string {
  const snapshotPath = join(app.getPath('userData'), 'session-snapshot.md')
  writeFileSync(snapshotPath, `# Session Snapshot - ${new Date().toISOString()}\n\n${context}`, 'utf8')
  return snapshotPath
}

export function loadContextSnapshot(): string | null {
  const snapshotPath = join(app.getPath('userData'), 'session-snapshot.md')
  if (!existsSync(snapshotPath)) return null
  return readFileSync(snapshotPath, 'utf8')
}

export function reloadClaudeSessions(cliPath: string | undefined, viaWsl?: boolean): SessionReloadResult {
  const os = platform()

  if (os === 'win32') {
    // Resolve the claude command to run in the new terminal
    const claudeCmd = cliPath && cliPath.startsWith('wsl.exe -e ')
      ? cliPath.replace('wsl.exe -e ', '')
      : 'claude'

    // Method 1: Windows Terminal (wt.exe) — modern Windows 10/11
    try {
      execSync(`wt.exe wsl.exe -e bash -l -c "${claudeCmd}"`, {
        windowsHide: false, timeout: 3000, stdio: 'ignore',
      })
      return {
        success: true,
        method: 'live-reload',
        message: 'Nouvelle session Claude Code ouverte dans Windows Terminal.',
      }
    } catch { /* try next */ }

    // Method 2: start wsl.exe in a new console window
    try {
      execSync(`cmd.exe /c start "Claude Code" wsl.exe -e bash -l -c "${claudeCmd}"`, {
        windowsHide: false, timeout: 3000, stdio: 'ignore', shell: false,
      })
      return {
        success: true,
        method: 'live-reload',
        message: 'Nouvelle session Claude Code ouverte.',
      }
    } catch { /* fallback */ }

    // Fallback: just inform the user
    return {
      success: true,
      method: 'notify',
      message: 'Ouvrez un nouveau terminal WSL et tapez `claude` pour démarrer une session avec vos outils actifs.',
    }
  }

  // Linux / macOS — open a new terminal with claude
  const term = detectTerminal()
  if (term) {
    try {
      execSync(`${term} -- bash -l -c "claude; exec bash" &`, { shell: true, stdio: 'ignore' })
      return { success: true, method: 'live-reload', message: 'Nouvelle session Claude Code ouverte.' }
    } catch { /* fallback */ }
  }

  return {
    success: true,
    method: 'notify',
    message: 'Ouvrez un nouveau terminal et tapez `claude` pour démarrer une session avec vos outils actifs.',
  }
}

function detectTerminal(): string | null {
  const candidates = ['gnome-terminal', 'xterm', 'konsole', 'xfce4-terminal', 'open -a Terminal']
  for (const t of candidates) {
    try {
      execSync(`which ${t.split(' ')[0]} 2>/dev/null`, { stdio: 'ignore' })
      return t
    } catch { /* next */ }
  }
  return null
}

import { execSync, spawn } from 'child_process'
import { platform } from 'os'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

export interface SessionReloadResult {
  success: boolean
  method: 'live-reload' | 'restart' | 'notify'
  message: string
}

function getClaudeProcesses(): number[] {
  const os = platform()
  try {
    if (os === 'win32') {
      const out = execSync('tasklist /FI "IMAGENAME eq claude.exe" /FO CSV', {
        encoding: 'utf8',
        windowsHide: true,
      })
      const pids: number[] = []
      for (const line of out.split('\n').slice(1)) {
        const match = line.match(/"(\d+)"/)
        if (match) pids.push(parseInt(match[1]))
      }
      return pids
    } else {
      const out = execSync('pgrep -f "claude" 2>/dev/null || true', {
        encoding: 'utf8',
        shell: true,
      })
      return out
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(Number)
    }
  } catch {
    return []
  }
}

export function isClaudeRunning(): boolean {
  return getClaudeProcesses().length > 0
}

export function saveContextSnapshot(context: string): string {
  const snapshotPath = join(app.getPath('userData'), 'session-snapshot.md')
  const timestamp = new Date().toISOString()
  writeFileSync(snapshotPath, `# Session Snapshot - ${timestamp}\n\n${context}`, 'utf8')
  return snapshotPath
}

export function loadContextSnapshot(): string | null {
  const snapshotPath = join(app.getPath('userData'), 'session-snapshot.md')
  if (!existsSync(snapshotPath)) return null
  return readFileSync(snapshotPath, 'utf8')
}

export function reloadClaudeSessions(cliPath: string | undefined): SessionReloadResult {
  const os = platform()
  const pids = getClaudeProcesses()

  if (pids.length === 0) {
    return {
      success: true,
      method: 'notify',
      message: 'Aucune session Claude Code active. Les nouveaux outils seront actifs au prochain démarrage.',
    }
  }

  try {
    if (os === 'win32') {
      for (const pid of pids) {
        execSync(`taskkill /PID ${pid} /F`, { windowsHide: true })
      }
    } else {
      for (const pid of pids) {
        process.kill(pid, 'SIGTERM')
      }
    }

    return {
      success: true,
      method: 'restart',
      message: `${pids.length} session(s) Claude Code redémarrée(s). Les nouveaux outils sont actifs.`,
    }
  } catch (err) {
    return {
      success: false,
      method: 'notify',
      message: 'Impossible de redémarrer Claude Code automatiquement. Veuillez le redémarrer manuellement.',
    }
  }
}

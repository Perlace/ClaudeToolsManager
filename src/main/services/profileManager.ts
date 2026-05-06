import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir, platform } from 'os'
import { execSync } from 'child_process'
import { app } from 'electron'
import type { Profile } from '../../types/shared'

const PROFILES_FILE = join(app.getPath('userData'), 'profiles.json')
const ACTIVE_PROFILE_FILE = join(app.getPath('userData'), 'active-profile.json')

function migrateExistingTools(): string[] {
  const legacyFile = join(app.getPath('userData'), 'enabled-tools.json')
  if (!existsSync(legacyFile)) return []
  try {
    return JSON.parse(readFileSync(legacyFile, 'utf8'))
  } catch {
    return []
  }
}

function buildDefaultProfiles(): Profile[] {
  const home = homedir()
  return [
    {
      id: 'perso',
      name: 'Personnel',
      configDir: '~/.claude',
      settingsPath: join(home, '.claude', 'settings.json'),
      claudeMdPath: join(home, 'CLAUDE.md'),
      commandsPath: join(home, '.claude', 'commands'),
      color: 'blue',
      theme: 'dark',
      enabledTools: migrateExistingTools(),
      permissions: { allow: [], deny: [] },
    },
    {
      id: 'pro',
      name: 'Pro',
      configDir: '~/.claude-pro',
      settingsPath: join(home, '.claude-pro', 'settings.json'),
      claudeMdPath: join(home, 'Documents', 'claude-pro', 'CLAUDE.md'),
      commandsPath: join(home, '.claude-pro', 'commands'),
      color: 'purple',
      theme: 'dark',
      enabledTools: [],
      permissions: { allow: [], deny: [] },
    },
  ]
}

export function getProfiles(): Profile[] {
  if (!existsSync(PROFILES_FILE)) {
    const defaults = buildDefaultProfiles()
    saveProfiles(defaults)
    return defaults
  }
  try {
    return JSON.parse(readFileSync(PROFILES_FILE, 'utf8'))
  } catch {
    return buildDefaultProfiles()
  }
}

export function saveProfiles(profiles: Profile[]): void {
  writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf8')
}

export function getProfileById(id: string): Profile | null {
  return getProfiles().find((p) => p.id === id) || null
}

export function updateProfileTools(profileId: string, enabledTools: string[]): void {
  const profiles = getProfiles()
  const idx = profiles.findIndex((p) => p.id === profileId)
  if (idx >= 0) {
    profiles[idx].enabledTools = enabledTools
    saveProfiles(profiles)
  }
}

export function applyProfilePermissions(profile: Profile): void {
  try {
    const { settingsPath, permissions } = profile
    if (!permissions) return
    const dir = settingsPath.replace(/[/\\][^/\\]+$/, '')
    mkdirSync(dir, { recursive: true })
    let settings: Record<string, unknown> = {}
    if (existsSync(settingsPath)) {
      try { settings = JSON.parse(readFileSync(settingsPath, 'utf8')) } catch { /* ignore */ }
    }
    if (permissions.allow.length === 0 && permissions.deny.length === 0) {
      delete settings['permissions']
    } else {
      settings['permissions'] = {
        ...(permissions.allow.length > 0 ? { allow: permissions.allow } : {}),
        ...(permissions.deny.length > 0 ? { deny: permissions.deny } : {}),
      }
    }
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8')
  } catch { /* silently fail if path doesn't exist yet */ }
}

export function getManualActiveProfileId(): string | null {
  if (!existsSync(ACTIVE_PROFILE_FILE)) return null
  try {
    return JSON.parse(readFileSync(ACTIVE_PROFILE_FILE, 'utf8')).id || null
  } catch {
    return null
  }
}

export function setManualActiveProfileId(id: string | null): void {
  if (id === null) {
    try { require('fs').unlinkSync(ACTIVE_PROFILE_FILE) } catch { /* ignore */ }
  } else {
    writeFileSync(ACTIVE_PROFILE_FILE, JSON.stringify({ id }), 'utf8')
  }
}

export function detectActiveProfileFromProcess(profiles: Profile[]): string | null {
  const os = platform()
  if (os !== 'linux' && os !== 'darwin') return null

  try {
    const out = execSync('pgrep -f "node.*claude" 2>/dev/null || true', {
      encoding: 'utf8', shell: true,
    })
    const pids = out.trim().split('\n').filter(Boolean)
    const home = homedir()

    for (const pid of pids) {
      try {
        const env = readFileSync(`/proc/${pid}/environ`, 'utf8').replace(/\0/g, '\n')
        const match = env.match(/CLAUDE_CONFIG_DIR=([^\n]+)/)
        if (match) {
          const configDir = match[1].trim().replace(/^~/, home)
          const profile = profiles.find((p) =>
            p.configDir.replace(/^~/, home) === configDir ||
            p.settingsPath.replace(/\/settings\.json$/, '').replace(/^~/, home) === configDir
          )
          if (profile) return profile.id
        }
      } catch { /* skip this pid */ }
    }
  } catch { /* ignore */ }

  return null
}

export function resolveActiveProfileId(profiles: Profile[]): string {
  // 1. Manual override first
  const manual = getManualActiveProfileId()
  if (manual && profiles.find((p) => p.id === manual)) return manual

  // 2. Auto-detect from running process
  const detected = detectActiveProfileFromProcess(profiles)
  if (detected) return detected

  // 3. Default to first profile
  return profiles[0]?.id || 'perso'
}

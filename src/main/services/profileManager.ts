import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, basename } from 'path'
import { homedir, platform } from 'os'
import { execSync } from 'child_process'
import { app } from 'electron'
import type { Profile } from '../../types/shared'

const PROFILE_COLORS = ['blue', 'purple', 'green', 'orange', 'cyan', 'red']

function configDirToName(configDir: string): string {
  const base = basename(configDir)
  if (base === '.claude') return 'Principal'
  const suffix = base.replace(/^\.claude[-_]?/, '')
  return suffix ? suffix.charAt(0).toUpperCase() + suffix.slice(1) : base
}

function configDirToId(configDir: string): string {
  return basename(configDir).replace(/^\./, '').replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'principal'
}

function buildProfile(configDir: string, colorIndex: number, existingTools: string[] = []): Profile {
  const home = homedir()
  const claudeMdPath = configDir === join(home, '.claude')
    ? join(home, 'CLAUDE.md')
    : join(configDir, 'CLAUDE.md')
  return {
    id: configDirToId(configDir),
    name: configDirToName(configDir),
    configDir: configDir.replace(home, '~'),
    settingsPath: join(configDir, 'settings.json'),
    claudeMdPath,
    commandsPath: join(configDir, 'commands'),
    color: PROFILE_COLORS[colorIndex % PROFILE_COLORS.length],
    theme: 'dark',
    enabledTools: existingTools,
    permissions: { allow: [], deny: [] },
  }
}

function discoverConfigDirs(): string[] {
  const home = homedir()
  const found = new Set<string>()

  // 1. Default ~/.claude
  found.add(join(home, '.claude'))

  // 2. Scan home for .claude-* or .claude_* dirs
  try {
    for (const entry of readdirSync(home)) {
      if (/^\.claude[-_].+/.test(entry)) {
        const full = join(home, entry)
        if (statSync(full).isDirectory()) found.add(full)
      }
    }
  } catch { /* ignore */ }

  // 3. Running processes with CLAUDE_CONFIG_DIR
  try {
    const pids = execSync('pgrep -f "node.*claude" 2>/dev/null || true', {
      encoding: 'utf8', shell: true,
    }).trim().split('\n').filter(Boolean)

    for (const pid of pids) {
      try {
        const env = readFileSync(`/proc/${pid}/environ`, 'utf8').replace(/\0/g, '\n')
        const match = env.match(/CLAUDE_CONFIG_DIR=([^\n]+)/)
        if (match) {
          const dir = match[1].trim().replace(/^~/, home)
          if (existsSync(dir)) found.add(dir)
        }
      } catch { /* skip */ }
    }
  } catch { /* ignore */ }

  return Array.from(found)
}

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
  const dirs = discoverConfigDirs()
  return dirs.map((dir, i) => buildProfile(
    dir,
    i,
    i === 0 ? migrateExistingTools() : []
  ))
}

export function syncDiscoveredProfiles(): Profile[] {
  const existing = getProfiles()
  const home = homedir()
  const discoveredDirs = discoverConfigDirs()
  let changed = false

  for (let i = 0; i < discoveredDirs.length; i++) {
    const dir = discoveredDirs[i]
    const id = configDirToId(dir)
    const alreadyExists = existing.find((p) =>
      p.id === id ||
      p.configDir.replace(/^~/, home) === dir ||
      p.settingsPath === join(dir, 'settings.json')
    )
    if (!alreadyExists) {
      existing.push(buildProfile(dir, existing.length))
      changed = true
    }
  }

  if (changed) saveProfiles(existing)
  return existing
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

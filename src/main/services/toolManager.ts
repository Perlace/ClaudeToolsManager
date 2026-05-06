import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, chmodSync } from 'fs'
import { join, basename, dirname } from 'path'
import { homedir } from 'os'
import { app } from 'electron'
import { readClaudeSettings, writeClaudeSettings, readGlobalClaudeMd, writeGlobalClaudeMd } from './claudeDetector'
import { getProfileById, updateProfileTools } from './profileManager'
import type { Tool, Profile } from '../../types/shared'

const CLAUDE_MD_SECTION_START = '<!-- CLAUDE-TOOLS-MANAGER:START -->'
const CLAUDE_MD_SECTION_END = '<!-- CLAUDE-TOOLS-MANAGER:END -->'
const CUSTOM_TOOLS_FILE = join(app.getPath('userData'), 'custom-tools.json')

export function getEnabledTools(profileId: string): string[] {
  const profile = getProfileById(profileId)
  return profile?.enabledTools || []
}


export function getCustomTools(): Tool[] {
  if (!existsSync(CUSTOM_TOOLS_FILE)) return []
  try {
    return JSON.parse(readFileSync(CUSTOM_TOOLS_FILE, 'utf8'))
  } catch {
    return []
  }
}

export function saveCustomTool(tool: Tool): void {
  const tools = getCustomTools()
  const existing = tools.findIndex((t) => t.id === tool.id)
  if (existing >= 0) tools[existing] = tool
  else tools.push(tool)
  writeFileSync(CUSTOM_TOOLS_FILE, JSON.stringify(tools, null, 2), 'utf8')
}

function mergeSectionsClaudeMd(existing: string, toolId: string, content: string): string {
  const startTag = `<!-- CTM:${toolId}:START -->`
  const endTag = `<!-- CTM:${toolId}:END -->`

  const blockContent = `${startTag}\n${content}\n${endTag}`

  const outerStart = existing.indexOf(CLAUDE_MD_SECTION_START)
  const outerEnd = existing.indexOf(CLAUDE_MD_SECTION_END)

  if (outerStart === -1 || outerEnd === -1) {
    return existing + `\n\n${CLAUDE_MD_SECTION_START}\n${blockContent}\n${CLAUDE_MD_SECTION_END}\n`
  }

  const before = existing.slice(0, outerStart + CLAUDE_MD_SECTION_START.length)
  const inside = existing.slice(outerStart + CLAUDE_MD_SECTION_START.length, outerEnd)
  const after = existing.slice(outerEnd)

  const toolStart = inside.indexOf(startTag)
  const toolEnd = inside.indexOf(endTag)

  let newInside: string
  if (toolStart !== -1 && toolEnd !== -1) {
    newInside = inside.slice(0, toolStart) + blockContent + inside.slice(toolEnd + endTag.length)
  } else {
    newInside = inside + '\n' + blockContent + '\n'
  }

  return before + newInside + after
}

function removeSectionClaudeMd(existing: string, toolId: string): string {
  const startTag = `<!-- CTM:${toolId}:START -->`
  const endTag = `<!-- CTM:${toolId}:END -->`

  const start = existing.indexOf(startTag)
  const end = existing.indexOf(endTag)
  if (start === -1 || end === -1) return existing

  return existing.slice(0, start).trimEnd() + '\n' + existing.slice(end + endTag.length)
}

export function enableTool(tool: Tool, profile: Profile): void {
  const enabled = profile.enabledTools
  if (!enabled.includes(tool.id)) {
    updateProfileTools(profile.id, [...enabled, tool.id])
  }
  const settingsPath = profile.settingsPath
  const claudeMdPath = profile.claudeMdPath

  if (tool.config?.settingsJson) {
    const settings = readClaudeSettings(settingsPath) as Record<string, unknown>
    const merged = deepMerge(settings, tool.config.settingsJson as Record<string, unknown>)
    writeClaudeSettings(settingsPath, merged)
  }

  if (tool.config?.claudeMd) {
    const md = readGlobalClaudeMd(claudeMdPath)
    const updated = mergeSectionsClaudeMd(md, tool.id, tool.config.claudeMd)
    writeGlobalClaudeMd(claudeMdPath, updated)
  }

  if (tool.config?.commands) {
    const dir = profile.commandsPath
    mkdirSync(dir, { recursive: true })
    for (const cmd of tool.config.commands) {
      writeFileSync(join(dir, `${cmd.name}.md`), cmd.content, 'utf8')
    }
  }

  if (tool.config?.files) {
    for (const file of tool.config.files) {
      const fullPath = file.path.replace(/^~/, homedir())
      mkdirSync(dirname(fullPath), { recursive: true })
      writeFileSync(fullPath, file.content, 'utf8')
      if (file.executable) chmodSync(fullPath, 0o755)
    }
  }
}

export function disableTool(tool: Tool, profile: Profile): void {
  updateProfileTools(profile.id, profile.enabledTools.filter((id) => id !== tool.id))
  const settingsPath = profile.settingsPath
  const claudeMdPath = profile.claudeMdPath

  if (tool.config?.settingsJson) {
    const settings = readClaudeSettings(settingsPath) as Record<string, unknown>
    const cleaned = deepRemove(settings, tool.config.settingsJson as Record<string, unknown>)
    writeClaudeSettings(settingsPath, cleaned)
  }

  if (tool.config?.claudeMd) {
    const md = readGlobalClaudeMd(claudeMdPath)
    const updated = removeSectionClaudeMd(md, tool.id)
    writeGlobalClaudeMd(claudeMdPath, updated)
  }

  if (tool.config?.commands) {
    const dir = profile.commandsPath
    for (const cmd of tool.config.commands) {
      const p = join(dir, `${cmd.name}.md`)
      if (existsSync(p)) unlinkSync(p)
    }
  }

  if (tool.config?.files) {
    for (const file of tool.config.files) {
      const fullPath = file.path.replace(/^~/, homedir())
      if (existsSync(fullPath)) unlinkSync(fullPath)
    }
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
    } else {
      result[key] = source[key]
    }
  }
  return result
}

function deepRemove(settings: Record<string, unknown>, toRemove: Record<string, unknown>): Record<string, unknown> {
  const result = { ...settings }
  for (const key of Object.keys(toRemove)) {
    if (key in result) {
      if (
        typeof toRemove[key] === 'object' &&
        toRemove[key] !== null &&
        !Array.isArray(toRemove[key]) &&
        typeof result[key] === 'object' &&
        result[key] !== null
      ) {
        const cleaned = deepRemove(result[key] as Record<string, unknown>, toRemove[key] as Record<string, unknown>)
        if (Object.keys(cleaned).length === 0) delete result[key]
        else result[key] = cleaned
      } else {
        delete result[key]
      }
    }
  }
  return result
}

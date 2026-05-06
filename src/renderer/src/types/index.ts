export type CategoryId =
  | 'superpowers'
  | 'frontend'
  | 'code-review'
  | 'security'
  | 'seo'
  | 'responsive'
  | 'memory'
  | 'tokens'
  | 'essential'

export type TokenImpact = 'saves' | 'neutral' | 'costs'
export type Difficulty = 'easy' | 'medium' | 'advanced'

export interface ToolConfig {
  settingsJson?: Record<string, unknown>
  claudeMd?: string
  commands?: Array<{ name: string; content: string }>
  files?: Array<{ path: string; content: string; executable?: boolean }>
}

export interface Tool {
  id: string
  name: string
  shortDescription: string
  description: string
  category: CategoryId
  tags: string[]
  tokenImpact: TokenImpact
  tokenEstimate: string
  difficulty: Difficulty
  config: ToolConfig
  tips: string[]
  isEnabled: boolean
  isImported: boolean
  author?: string
  version?: string
  homepage?: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  gradient: string
}

export interface Profile {
  id: string
  name: string
  configDir: string
  settingsPath: string
  claudeMdPath: string
  commandsPath: string
  color: string
  enabledTools: string[]
}

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

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

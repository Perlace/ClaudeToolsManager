import { useState } from 'react'
import { Plus, Trash2, Shield, Zap, Lock, Code2, ChevronDown } from 'lucide-react'
import { useToolStore } from '../store/toolStore'
import type { ProfilePermissions } from '../types'

const PRESETS: Array<{ id: string; name: string; icon: React.ReactNode; description: string; permissions: ProfilePermissions }> = [
  {
    id: 'yolo',
    name: 'Yolo',
    icon: <Zap size={14} />,
    description: 'Tout autoriser — aucune restriction',
    permissions: { allow: ['*'], deny: [] },
  },
  {
    id: 'dev',
    name: 'Dev',
    icon: <Code2 size={14} />,
    description: 'Outils de développement courants',
    permissions: {
      allow: [
        'Bash(git:*)',
        'Bash(npm:*)',
        'Bash(node:*)',
        'Bash(npx:*)',
        'Bash(yarn:*)',
        'Bash(pnpm:*)',
        'Read(*)',
        'Write(*)',
        'Edit(*)',
      ],
      deny: [],
    },
  },
  {
    id: 'safe',
    name: 'Sécurisé',
    icon: <Shield size={14} />,
    description: 'Lecture seule, pas de shell',
    permissions: {
      allow: ['Read(*)'],
      deny: ['Bash(*)', 'Write(*)', 'Edit(*)'],
    },
  },
  {
    id: 'custom',
    name: 'Personnalisé',
    icon: <Lock size={14} />,
    description: 'Configurer manuellement',
    permissions: { allow: [], deny: [] },
  },
]

function RuleInput({ placeholder, onAdd }: { placeholder: string; onAdd: (rule: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) { onAdd(value.trim()); setValue('') } }}
        placeholder={placeholder}
        className="input flex-1 h-8 text-xs"
      />
      <button
        onClick={() => { if (value.trim()) { onAdd(value.trim()); setValue('') } }}
        className="btn-secondary h-8 px-3 text-xs flex items-center gap-1"
      >
        <Plus size={12} />
        Ajouter
      </button>
    </div>
  )
}

export function Permissions() {
  const { profiles, activeProfileId, saveProfile, addToast } = useToolStore()
  const [openPreset, setOpenPreset] = useState(false)
  const profile = profiles.find((p) => p.id === activeProfileId)

  if (!profile) return (
    <div className="flex items-center justify-center h-full text-text-muted text-sm">
      Aucun profil sélectionné
    </div>
  )

  const perms = profile.permissions || { allow: [], deny: [] }

  async function updatePerms(next: ProfilePermissions) {
    await saveProfile({ ...profile!, permissions: next })
    addToast({ type: 'success', title: 'Permissions sauvegardées', message: `Profil "${profile!.name}" mis à jour.` })
  }

  function applyPreset(preset: typeof PRESETS[0]) {
    if (preset.id === 'custom') return
    updatePerms(preset.permissions)
    setOpenPreset(false)
  }

  function addAllow(rule: string) {
    if (perms.allow.includes(rule)) return
    updatePerms({ ...perms, allow: [...perms.allow, rule] })
  }

  function removeAllow(rule: string) {
    updatePerms({ ...perms, allow: perms.allow.filter((r) => r !== rule) })
  }

  function addDeny(rule: string) {
    if (perms.deny.includes(rule)) return
    updatePerms({ ...perms, deny: [...perms.deny, rule] })
  }

  function removeDeny(rule: string) {
    updatePerms({ ...perms, deny: perms.deny.filter((r) => r !== rule) })
  }

  const PROFILE_COLORS: Record<string, string> = {
    blue: 'bg-blue-500', purple: 'bg-purple-500', green: 'bg-green-500',
    orange: 'bg-orange-500', red: 'bg-red-500', cyan: 'bg-cyan-500',
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2.5 h-2.5 rounded-full ${PROFILE_COLORS[profile.color] || 'bg-blue-500'}`} />
            <h1 className="text-base font-bold text-text">Permissions — {profile.name}</h1>
          </div>
          <p className="text-xs text-text-muted">
            Règles écrites dans <code className="text-accent">{profile.settingsPath}</code>
          </p>
        </div>

        {/* Preset selector */}
        <div className="relative">
          <button
            onClick={() => setOpenPreset(!openPreset)}
            className="btn-secondary flex items-center gap-2 h-8 px-3 text-xs"
          >
            <Shield size={13} />
            Preset
            <ChevronDown size={11} className={`transition-transform ${openPreset ? 'rotate-180' : ''}`} />
          </button>
          {openPreset && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-2xl shadow-card-hover z-50 py-1 overflow-hidden">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 text-xs hover:bg-surface transition-all text-left"
                >
                  <span className="text-accent mt-0.5 shrink-0">{p.icon}</span>
                  <div>
                    <div className="font-semibold text-text">{p.name}</div>
                    <div className="text-text-muted text-2xs">{p.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Allow rules */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green" />
          <h2 className="text-sm font-semibold text-text">Autorisées</h2>
          <span className="text-2xs text-text-muted ml-auto">{perms.allow.length} règle{perms.allow.length !== 1 ? 's' : ''}</span>
        </div>
        <RuleInput placeholder="Ex: Bash(git:*), Read(*), Write(*)" onAdd={addAllow} />
        <div className="space-y-1">
          {perms.allow.length === 0 && (
            <p className="text-2xs text-text-dim text-center py-2">Aucune règle — utilise un preset ou ajoute manuellement</p>
          )}
          {perms.allow.map((rule) => (
            <div key={rule} className="flex items-center gap-2 px-3 py-1.5 bg-green/5 border border-green/20 rounded-xl text-xs">
              <span className="flex-1 font-mono text-green">{rule}</span>
              <button onClick={() => removeAllow(rule)} className="text-text-muted hover:text-red transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Deny rules */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <h2 className="text-sm font-semibold text-text">Refusées</h2>
          <span className="text-2xs text-text-muted ml-auto">{perms.deny.length} règle{perms.deny.length !== 1 ? 's' : ''}</span>
        </div>
        <RuleInput placeholder="Ex: Bash(rm:*), Bash(curl:*)" onAdd={addDeny} />
        <div className="space-y-1">
          {perms.deny.length === 0 && (
            <p className="text-2xs text-text-dim text-center py-2">Aucune restriction</p>
          )}
          {perms.deny.map((rule) => (
            <div key={rule} className="flex items-center gap-2 px-3 py-1.5 bg-red/5 border border-red/20 rounded-xl text-xs">
              <span className="flex-1 font-mono text-red-400">{rule}</span>
              <button onClick={() => removeDeny(rule)} className="text-text-muted hover:text-red transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <p className="text-2xs text-text-dim text-center">
        Les permissions sont appliquées dans <code>settings.json</code> à chaque modification · <a
          href="https://docs.anthropic.com/fr/docs/claude-code/settings"
          onClick={(e) => { e.preventDefault(); api.openExternal('https://docs.anthropic.com/fr/docs/claude-code/settings') }}
          className="text-accent hover:underline cursor-pointer"
        >docs Claude Code</a>
      </p>
    </div>
  )
}

const api = window.electronAPI

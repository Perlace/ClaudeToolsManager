import type { TokenImpact, Difficulty } from '../../types'

export function TokenBadge({ impact, estimate }: { impact: TokenImpact; estimate: string }) {
  const map: Record<TokenImpact, { cls: string; label: string; prefix: string }> = {
    saves: { cls: 'badge-green', label: 'Économie', prefix: '' },
    neutral: { cls: 'badge-yellow', label: 'Neutre', prefix: '' },
    costs: { cls: 'badge-red', label: 'Consomme', prefix: '' },
  }
  const { cls, label } = map[impact]
  return (
    <span className={cls}>
      {label} {estimate}
    </span>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const map: Record<Difficulty, { cls: string; label: string }> = {
    easy: { cls: 'badge-green', label: 'Facile' },
    medium: { cls: 'badge-yellow', label: 'Moyen' },
    advanced: { cls: 'badge-purple', label: 'Avancé' },
  }
  const { cls, label } = map[difficulty]
  return <span className={cls}>{label}</span>
}

export function TagBadge({ tag }: { tag: string }) {
  return <span className="badge badge-cyan">{tag}</span>
}

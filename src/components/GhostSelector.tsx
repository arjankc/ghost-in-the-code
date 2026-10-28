import { characters } from '../characters'
import type { GhostId, ProgressState } from '../types'
import { GhostPortrait } from './GhostPortrait'

type Props = {
  selected: GhostId
  progress: ProgressState
  onSelect: (id: GhostId) => void
  disabled?: boolean
}

function affinityLabel(n: number): string {
  if (n >= 120) return 'BOUND'
  if (n >= 70) return 'FAMILIAR'
  if (n >= 30) return 'AWARE'
  if (n >= 1) return 'WHISPER'
  return 'DISTANT'
}

export function GhostSelector({
  selected,
  progress,
  onSelect,
  disabled,
}: Props) {
  return (
    <div className="side-section">
      <h2>Summon a Ghost</h2>
      {characters.map((ghost) => {
        const aff = progress.ghostAffinity[ghost.id] ?? 0
        const pct = Math.min(100, Math.round((aff / 120) * 100))
        return (
          <button
            key={ghost.id}
            type="button"
            className={`ghost-card ${selected === ghost.id ? 'active' : ''}`}
            style={{ ['--ghost-accent' as string]: ghost.accent }}
            disabled={disabled}
            onClick={() => onSelect(ghost.id)}
          >
            <div className="ghost-card__row">
              <GhostPortrait
                id={ghost.id}
                accent={ghost.accent}
                size={52}
                animate={selected === ghost.id}
              />
              <div className="ghost-card__body">
                <div className="name">{ghost.displayName}</div>
                <div className="desc">{ghost.shortDescription}</div>
                <div className="affinity-row">
                  <span>{affinityLabel(aff)}</span>
                  <div className="hp-bar affinity-bar" aria-hidden>
                    <div className="hp-bar__fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </button>
        )
      })}
      <p className="disclaimer">
        Fictional AI characters inspired by computing history — not conscious
        entities and not primary historical sources. Affinity rises as you talk
        and solve their preferred cases.
      </p>
    </div>
  )
}

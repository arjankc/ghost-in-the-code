import { characters } from '../characters'
import type { GhostId } from '../types'

type Props = {
  selected: GhostId
  onSelect: (id: GhostId) => void
  disabled?: boolean
}

export function GhostSelector({ selected, onSelect, disabled }: Props) {
  return (
    <div className="side-section">
      <h2>Summon a Ghost</h2>
      {characters.map((ghost) => (
        <button
          key={ghost.id}
          type="button"
          className={`ghost-card ${selected === ghost.id ? 'active' : ''}`}
          style={{ ['--ghost-accent' as string]: ghost.accent }}
          disabled={disabled}
          onClick={() => onSelect(ghost.id)}
        >
          <div className="name">{ghost.displayName}</div>
          <div className="desc">{ghost.shortDescription}</div>
        </button>
      ))}
      <p className="disclaimer">
        Fictional AI characters inspired by computing history — not conscious
        entities and not primary historical sources.
      </p>
    </div>
  )
}

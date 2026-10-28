import { relics } from '../game/relics'
import { sfx } from '../services/audio'
import type { ProgressState } from '../types'

type Props = {
  progress: ProgressState
  onEquip: (relicId: string) => void
}

export function RelicShelf({ progress, onEquip }: Props) {
  return (
    <div className="side-section">
      <h2>Relic Shelf</h2>
      <p className="disclaimer">
        Unlock cosmetic terminal themes by leveling up. Purely local — no loot
        boxes.
      </p>
      <div className="relic-grid">
        {relics.map((r) => {
          const unlocked = progress.unlockedRelics.includes(r.id)
          const equipped = progress.equippedRelic === r.id
          return (
            <button
              key={r.id}
              type="button"
              className={`relic-card ${unlocked ? 'on' : ''} ${equipped ? 'eq' : ''}`}
              disabled={!unlocked}
              style={{
                ['--relic-color' as string]: r.theme.phosphor,
              }}
              onClick={() => {
                sfx.toggle()
                onEquip(r.id)
              }}
              title={
                unlocked
                  ? r.blurb
                  : `Unlocks at level ${r.unlockLevel}`
              }
            >
              <span className="relic-swatch" aria-hidden />
              <span className="relic-name">{r.name}</span>
              <span className="relic-meta">
                {equipped ? 'EQUIPPED' : unlocked ? `LV ${r.unlockLevel}` : `LOCKED LV ${r.unlockLevel}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

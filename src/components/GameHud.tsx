import { levelFromXp, titleForLevel, xpForLevel } from '../game/progression'
import type { ProgressState } from '../types'

type Props = {
  progress: ProgressState
  xpFlash?: number
}

export function GameHud({ progress, xpFlash = 0 }: Props) {
  const { into, need } = levelFromXp(progress.xp)
  const pct = Math.min(100, Math.round((into / need) * 100))
  const title = titleForLevel(progress.level)

  return (
    <div className="game-hud" aria-label="Player status">
      <div className="game-hud__row">
        <span className="game-hud__level">LV {progress.level}</span>
        <span className="game-hud__title">{title}</span>
        <span className="game-hud__xp">
          {into}/{need} XP
          {xpFlash > 0 ? <span className="xp-pop">+{xpFlash}</span> : null}
        </span>
      </div>
      <div className="xp-bar" title={`Next level needs ${xpForLevel(progress.level)} XP`}>
        <div className="xp-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="game-hud__meta">
        <span className={progress.combo > 0 ? 'combo-hot' : ''}>
          COMBO ×{progress.combo}
        </span>
        <span>STREAK {progress.dailyStreak}d</span>
        <span>BEST ×{progress.bestCombo}</span>
      </div>
    </div>
  )
}

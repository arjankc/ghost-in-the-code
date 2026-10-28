import {
  achievements,
  spiritRank,
  totalBestScore,
} from '../achievements/catalog'
import type { ProgressState } from '../types'

type Props = {
  progress: ProgressState
  toastIds?: string[]
}

export function AchievementsPanel({ progress, toastIds = [] }: Props) {
  const total = totalBestScore(progress)
  const rank = spiritRank(total)
  const unlocked = new Set(progress.unlockedAchievements)

  return (
    <div className="side-section">
      <h2>Spirit Rank</h2>
      <div className="rank-card">
        <div className="rank-card__name">{rank}</div>
        <div className="rank-card__meta">
          {total} pts · {progress.completedPuzzleIds.length} cases ·{' '}
          {progress.unlockedAchievements.length}/{achievements.length} rites
        </div>
        <div className="hp-bar" aria-hidden>
          <div
            className="hp-bar__fill"
            style={{ width: `${Math.min(100, (total / 400) * 100)}%` }}
          />
        </div>
      </div>

      <h2>Achievements</h2>
      <ul className="achieve-list">
        {achievements.map((a) => {
          const on = unlocked.has(a.id)
          const fresh = toastIds.includes(a.id)
          return (
            <li
              key={a.id}
              className={`achieve-item ${on ? 'on' : ''} ${fresh ? 'fresh' : ''}`}
            >
              <span className="achieve-mark" aria-hidden>
                {on ? '◆' : '◇'}
              </span>
              <span>
                <strong>{a.title}</strong>
                <span className="desc">{a.description}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

import { quests } from '../game/quests'
import type { ProgressState } from '../types'

type Props = {
  progress: ProgressState
}

export function QuestBoard({ progress }: Props) {
  return (
    <div className="side-section">
      <h2>Quest Board</h2>
      <ul className="quest-list">
        {quests.map((q) => {
          const done = progress.completedQuests.includes(q.id)
          let current = progress.questProgress[q.id] ?? 0
          if (q.id === 'level_three') current = Math.min(q.target, progress.level)
          if (q.id === 'meet_the_dead')
            current = Math.min(q.target, progress.spokenGhostIds.length)
          if (q.id === 'streak_three')
            current = Math.min(q.target, progress.dailyStreak)
          if (q.id === 'combo_two')
            current = Math.min(q.target, progress.bestCombo)
          if (done) current = q.target
          const pct = Math.round((current / q.target) * 100)
          return (
            <li key={q.id} className={`quest-item ${done ? 'done' : ''}`}>
              <div className="quest-item__top">
                <strong>{q.title}</strong>
                <span>
                  {done ? 'DONE' : `${current}/${q.target}`}
                </span>
              </div>
              <div className="desc">{q.description}</div>
              <div className="hp-bar" aria-hidden>
                <div className="hp-bar__fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="quest-xp">+{q.xpReward} XP</div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

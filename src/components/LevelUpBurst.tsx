import { titleForLevel } from '../game/progression'

type Props = {
  level: number | null
  onDismiss: () => void
}

export function LevelUpBurst({ level, onDismiss }: Props) {
  if (level === null) return null
  return (
    <div className="level-burst" role="status" onClick={onDismiss}>
      <div className="level-burst__card">
        <div className="level-burst__label">LEVEL UP</div>
        <div className="level-burst__level">{level}</div>
        <div className="level-burst__title">{titleForLevel(level)}</div>
        <div className="score-burst__hint">new power hums in the terminal</div>
      </div>
    </div>
  )
}

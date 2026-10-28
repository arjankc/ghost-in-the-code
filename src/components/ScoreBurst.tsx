type Props = {
  score: number | null
  title?: string
  onDismiss: () => void
}

export function ScoreBurst({ score, title, onDismiss }: Props) {
  if (score === null) return null

  return (
    <div className="score-burst" role="status" onClick={onDismiss}>
      <div className="score-burst__card">
        <div className="score-burst__label">BUG EXORCISED</div>
        {title ? <div className="score-burst__title">{title}</div> : null}
        <div className="score-burst__score">+{score}</div>
        <div className="score-burst__hint">click to continue</div>
      </div>
    </div>
  )
}

type Props = {
  open: boolean
  onClose: () => void
}

export function HelpOverlay({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="help-overlay" role="dialog" aria-label="Keyboard help" onClick={onClose}>
      <div className="help-card" onClick={(e) => e.stopPropagation()}>
        <h2>How to Play</h2>
        <ul>
          <li>
            <kbd>Enter</kbd> send · <kbd>Shift</kbd>+<kbd>Enter</kbd> newline ·{' '}
            <kbd>?</kbd> help
          </li>
          <li>Chat with ghosts to earn XP and raise affinity</li>
          <li>Exorcise bugs for score, combo XP, and quest progress</li>
          <li>Hints cut score and break your combo</li>
          <li>Level up to unlock relics (terminal themes) and advanced cases</li>
          <li>Daily streak: return each day for vigil XP</li>
          <li>Everything stays local — no accounts or cloud saves</li>
        </ul>
        <button type="button" className="btn primary" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  )
}

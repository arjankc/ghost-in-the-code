import { useMemo, useState } from 'react'
import { puzzles } from '../puzzles/puzzles'
import { scoreForHints } from '../puzzles/scoring'
import { isCorrectAnswer } from '../puzzles/validate'
import type { ProgressState, Puzzle } from '../types'

type Props = {
  progress: ProgressState
  busy: boolean
  onAskHint: (puzzle: Puzzle, hintsUsed: number) => void
  onSolved: (puzzleId: string, score: number) => void
}

export function MysteryPanel({ progress, busy, onAskHint, onSolved }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)

  const active = useMemo(
    () => puzzles.find((p) => p.id === activeId) ?? null,
    [activeId],
  )

  function begin(puzzle: Puzzle) {
    setActiveId(puzzle.id)
    setAttempt('')
    setHintsUsed(0)
    setFeedback(null)
  }

  function submit() {
    if (!active) return
    if (isCorrectAnswer(attempt, active.acceptedAnswers)) {
      const score = scoreForHints(hintsUsed)
      setFeedback(`${active.completionMessage} Score: ${score}. ${active.explanation}`)
      onSolved(active.id, score)
    } else {
      setFeedback('Incorrect. The bug still lurks — try again or request a hint.')
    }
  }

  function hint() {
    if (!active) return
    const next = Math.min(hintsUsed + 1, active.hints.length)
    setHintsUsed(next)
    const canned = active.hints[next - 1]
    setFeedback(`Hint ${next}: ${canned}`)
    onAskHint(active, next)
  }

  return (
    <div className="side-section">
      <h2>Exorcise the Bug</h2>
      <p className="disclaimer">
        Scoring is deterministic (100 / 75 / 50 / 25 by hints used). The model
        may narrate; it does not judge answers.
      </p>

      {!active ? (
        puzzles.map((puzzle) => {
          const best = progress.bestScores[puzzle.id]
          return (
            <button
              key={puzzle.id}
              type="button"
              className="ghost-card"
              onClick={() => begin(puzzle)}
            >
              <div className="name">{puzzle.title}</div>
              <div className="desc">
                {puzzle.difficulty} · {puzzle.category}
                {best !== undefined ? ` · best ${best}` : ''}
              </div>
            </button>
          )
        })
      ) : (
        <div className="puzzle-card">
          <h3>{active.title}</h3>
          <div className="puzzle-meta">
            {active.difficulty} · hints used {hintsUsed} · potential{' '}
            {scoreForHints(hintsUsed)} pts
          </div>
          <p className="disclaimer">{active.story}</p>
          <pre className="code-block">{active.code}</pre>
          <p className="disclaimer">{active.task}</p>
          <textarea
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            rows={2}
            placeholder="Your answer…"
            aria-label="Puzzle answer"
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(125,255,154,0.25)',
              padding: '0.45rem',
              color: 'var(--phosphor)',
            }}
          />
          <div className="setup-actions">
            <button
              type="button"
              className="btn primary"
              disabled={busy || !attempt.trim()}
              onClick={submit}
            >
              SUBMIT
            </button>
            <button
              type="button"
              className="btn amber"
              disabled={busy || hintsUsed >= active.hints.length}
              onClick={hint}
            >
              HINT
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setActiveId(null)
                setFeedback(null)
              }}
            >
              BACK
            </button>
          </div>
          {feedback ? <p className="disclaimer">{feedback}</p> : null}
        </div>
      )}
    </div>
  )
}

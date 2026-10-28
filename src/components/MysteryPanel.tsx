import { useMemo, useState } from 'react'
import { puzzles } from '../puzzles/puzzles'
import { scoreForHints } from '../puzzles/scoring'
import { isCorrectAnswer } from '../puzzles/validate'
import { sfx } from '../services/audio'
import type { ProgressState, Puzzle } from '../types'

type Props = {
  progress: ProgressState
  busy: boolean
  onAskHint: (puzzle: Puzzle, hintsUsed: number) => void
  onSolved: (puzzleId: string, score: number, title: string) => void
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
    sfx.click()
    setActiveId(puzzle.id)
    setAttempt('')
    setHintsUsed(0)
    setFeedback(null)
  }

  function submit() {
    if (!active) return
    if (isCorrectAnswer(attempt, active.acceptedAnswers)) {
      const score = scoreForHints(hintsUsed)
      sfx.correct()
      setFeedback(`${active.completionMessage} Score: ${score}. ${active.explanation}`)
      onSolved(active.id, score, active.title)
    } else {
      sfx.wrong()
      setFeedback('Incorrect. The bug still lurks — try again or request a hint.')
    }
  }

  function hint() {
    if (!active) return
    sfx.hint()
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
          const done = progress.completedPuzzleIds.includes(puzzle.id)
          return (
            <button
              key={puzzle.id}
              type="button"
              className={`ghost-card puzzle-pick ${done ? 'puzzle-pick--done' : ''}`}
              onClick={() => begin(puzzle)}
            >
              <div className="puzzle-pick__icon" aria-hidden>
                {done ? '✓' : '◈'}
              </div>
              <div>
                <div className="name">{puzzle.title}</div>
                <div className="desc">
                  {puzzle.difficulty} · {puzzle.category}
                  {best !== undefined ? ` · best ${best}` : ''}
                </div>
              </div>
            </button>
          )
        })
      ) : (
        <div className="puzzle-card puzzle-card--active">
          <h3>{active.title}</h3>
          <div className="puzzle-meta">
            {active.difficulty} · hints used {hintsUsed} · potential{' '}
            {scoreForHints(hintsUsed)} pts
          </div>
          <div className="hp-bar" aria-hidden>
            <div
              className="hp-bar__fill"
              style={{ width: `${Math.max(25, 100 - hintsUsed * 25)}%` }}
            />
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
            className="puzzle-answer"
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
                sfx.click()
                setActiveId(null)
                setFeedback(null)
              }}
            >
              BACK
            </button>
          </div>
          {feedback ? (
            <p
              className={`feedback-line ${feedback.startsWith('Incorrect') ? 'feedback-line--bad' : 'feedback-line--good'}`}
            >
              {feedback}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { puzzles } from '../puzzles/puzzles'
import { scoreForHints } from '../puzzles/scoring'
import { isCorrectAnswer } from '../puzzles/validate'
import { sfx } from '../services/audio'
import type { ProgressState, Puzzle, PuzzleDifficulty } from '../types'

type Props = {
  progress: ProgressState
  busy: boolean
  onDifficultyChange: (d: PuzzleDifficulty | 'any') => void
  onBeginCase: (puzzle: Puzzle) => void
  onAskHint: (puzzle: Puzzle, hintsUsed: number) => void
  onFail: () => void
  onSolved: (puzzle: Puzzle, score: number, hintsUsed: number) => void
}

export function MysteryPanel({
  progress,
  busy,
  onDifficultyChange,
  onBeginCase,
  onAskHint,
  onFail,
  onSolved,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  const filtered = useMemo(() => {
    const pref = progress.preferredDifficulty
    if (pref === 'any') return puzzles
    return puzzles.filter((p) => p.difficulty === pref)
  }, [progress.preferredDifficulty])

  const active = useMemo(
    () => puzzles.find((p) => p.id === activeId) ?? null,
    [activeId],
  )

  function begin(puzzle: Puzzle) {
    const need = puzzle.minLevel ?? 1
    if (progress.level < need) {
      sfx.wrong()
      setFeedback(`Locked — reach level ${need} to open this case.`)
      return
    }
    sfx.click()
    setActiveId(puzzle.id)
    setAttempt('')
    setHintsUsed(0)
    setFeedback(null)
    onBeginCase(puzzle)
  }

  function submit() {
    if (!active) return
    if (isCorrectAnswer(attempt, active.acceptedAnswers)) {
      const score = scoreForHints(hintsUsed)
      if (progress.combo >= 1) sfx.combo()
      else sfx.correct()
      setFeedback(
        `${active.completionMessage} Score: ${score}. ${active.explanation}`,
      )
      onSolved(active, score, hintsUsed)
    } else {
      sfx.wrong()
      setShake(true)
      window.setTimeout(() => setShake(false), 400)
      setFeedback('Incorrect. The bug still lurks — try again or request a hint.')
      onFail()
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
        Scoring is deterministic (100 / 75 / 50 / 25 by hints). Combos boost XP.
        The model never judges answers.
      </p>

      {!active ? (
        <>
          <label className="diff-label">
            Difficulty
            <select
              className="diff-select"
              value={progress.preferredDifficulty}
              onChange={(e) => {
                sfx.toggle()
                onDifficultyChange(e.target.value as PuzzleDifficulty | 'any')
              }}
              aria-label="Puzzle difficulty filter"
            >
              <option value="any">Any</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          {feedback && !activeId ? (
            <p className="feedback-line feedback-line--bad">{feedback}</p>
          ) : null}

          {filtered.length === 0 ? (
            <p className="disclaimer">No cases match this filter.</p>
          ) : (
            filtered.map((puzzle) => {
              const best = progress.bestScores[puzzle.id]
              const done = progress.completedPuzzleIds.includes(puzzle.id)
              const need = puzzle.minLevel ?? 1
              const locked = progress.level < need
              return (
                <button
                  key={puzzle.id}
                  type="button"
                  className={`ghost-card puzzle-pick ${done ? 'puzzle-pick--done' : ''} ${locked ? 'puzzle-pick--locked' : ''}`}
                  onClick={() => begin(puzzle)}
                >
                  <div className="puzzle-pick__icon" aria-hidden>
                    {locked ? '#' : done ? '✓' : '◈'}
                  </div>
                  <div>
                    <div className="name">{puzzle.title}</div>
                    <div className="desc">
                      {puzzle.difficulty} · {puzzle.category}
                      {locked ? ` · LV ${need}` : ''}
                      {best !== undefined ? ` · best ${best}` : ''}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </>
      ) : (
        <div
          className={`puzzle-card puzzle-card--active ${shake ? 'puzzle-shake' : ''}`}
        >
          <h3>{active.title}</h3>
          <div className="puzzle-meta">
            {active.difficulty} · hints {hintsUsed} · potential{' '}
            {scoreForHints(hintsUsed)} pts · combo ×{progress.combo}
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

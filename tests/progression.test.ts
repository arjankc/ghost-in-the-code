import { describe, expect, it } from 'vitest'
import { applyGameEvent } from '../src/game/engine'
import { levelFromXp, titleForLevel, xpForLevel } from '../src/game/progression'
import { defaultProgress } from '../src/services/storage'

describe('progression', () => {
  it('computes level thresholds', () => {
    expect(xpForLevel(1)).toBeGreaterThan(0)
    expect(levelFromXp(0).level).toBe(1)
    expect(titleForLevel(1)).toBe('NOVICE')
    expect(titleForLevel(5)).toBe('EXORCIST')
  })

  it('awards XP and combo on puzzle solve', () => {
    let state = defaultProgress()
    const first = applyGameEvent(state, {
      type: 'puzzle_solved',
      puzzleId: 'off-by-one-lanterns',
      score: 100,
      difficulty: 'beginner',
      preferredGhost: 'basic',
    })
    expect(first.xpGained).toBeGreaterThan(0)
    expect(first.state.combo).toBe(1)
    expect(first.state.completedPuzzleIds).toContain('off-by-one-lanterns')

    const second = applyGameEvent(first.state, {
      type: 'puzzle_solved',
      puzzleId: 'inverted-gate',
      score: 100,
      difficulty: 'beginner',
    })
    expect(second.state.combo).toBe(2)
    expect(second.state.bestCombo).toBe(2)
  })

  it('breaks combo on fail', () => {
    let state = defaultProgress()
    state = applyGameEvent(state, {
      type: 'puzzle_solved',
      puzzleId: 'a',
      score: 75,
      difficulty: 'beginner',
    }).state
    state = applyGameEvent(state, { type: 'puzzle_fail' }).state
    expect(state.combo).toBe(0)
  })

  it('starts a daily streak', () => {
    const delta = applyGameEvent(defaultProgress(), { type: 'session_start' })
    expect(delta.state.dailyStreak).toBe(1)
    expect(delta.xpGained).toBeGreaterThan(0)
  })
})

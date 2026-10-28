import { describe, expect, it } from 'vitest'
import { mergeBestScore, scoreForHints } from '../src/puzzles/scoring'

describe('scoreForHints', () => {
  it('returns 100 with no hints', () => {
    expect(scoreForHints(0)).toBe(100)
  })

  it('applies hint penalties', () => {
    expect(scoreForHints(1)).toBe(75)
    expect(scoreForHints(2)).toBe(50)
    expect(scoreForHints(3)).toBe(25)
    expect(scoreForHints(99)).toBe(25)
  })
})

describe('mergeBestScore', () => {
  it('keeps the higher score', () => {
    expect(mergeBestScore(undefined, 75)).toBe(75)
    expect(mergeBestScore(50, 100)).toBe(100)
    expect(mergeBestScore(100, 50)).toBe(100)
  })
})

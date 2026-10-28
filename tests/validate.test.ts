import { describe, expect, it } from 'vitest'
import { isCorrectAnswer, normalizeAnswer } from '../src/puzzles/validate'

describe('normalizeAnswer', () => {
  it('trims and lowercases', () => {
    expect(normalizeAnswer('  Day <= 10. ')).toBe('day <= 10')
  })
})

describe('isCorrectAnswer', () => {
  const accepted = ['day <= 10', 'day < 11']

  it('accepts normalized matches', () => {
    expect(isCorrectAnswer('Day <= 10', accepted)).toBe(true)
    expect(isCorrectAnswer('DAY < 11;', accepted)).toBe(true)
  })

  it('rejects wrong answers', () => {
    expect(isCorrectAnswer('day < 10', accepted)).toBe(false)
    expect(isCorrectAnswer('', accepted)).toBe(false)
  })
})

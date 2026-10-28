import { describe, expect, it } from 'vitest'
import {
  evaluateAchievements,
  perfectClearCount,
  spiritRank,
  totalBestScore,
} from '../src/achievements/catalog'
import { defaultProgress } from '../src/services/storage'
import type { ProgressState } from '../src/types'

function base(partial: Partial<ProgressState> = {}): ProgressState {
  return { ...defaultProgress(), ...partial }
}

describe('achievements', () => {
  it('sums best scores and ranks spirits', () => {
    const p = base({ bestScores: { a: 100, b: 75 } })
    expect(totalBestScore(p)).toBe(175)
    expect(spiritRank(0)).toBe('NOVICE')
    expect(spiritRank(100)).toBe('APPRENTICE')
    expect(spiritRank(250)).toBe('EXORCIST')
  })

  it('counts perfect clears', () => {
    expect(perfectClearCount(base({ bestScores: { a: 100, b: 75 } }))).toBe(1)
  })

  it('unlocks first exorcism and perfect rite', () => {
    const newly = evaluateAchievements(
      base({
        completedPuzzleIds: ['x'],
        bestScores: { x: 100 },
      }),
      ['cobol'],
      6,
    )
    expect(newly).toContain('first_exorcism')
    expect(newly).toContain('perfect_rite')
  })

  it('unlocks triple summon when all ghosts spoken', () => {
    const newly = evaluateAchievements(base(), ['cobol', 'basic', 'assembly'], 6)
    expect(newly).toContain('triple_summon')
  })
})

import type { GhostId, ProgressState } from '../types'

export type AchievementId =
  | 'first_exorcism'
  | 'perfect_rite'
  | 'triple_summon'
  | 'all_cases'
  | 'hintless_hunter'
  | 'night_shift'
  | 'level_five'
  | 'combo_king'
  | 'streak_keeper'

export type Achievement = {
  id: AchievementId
  title: string
  description: string
}

export const achievements: Achievement[] = [
  {
    id: 'first_exorcism',
    title: 'First Exorcism',
    description: 'Close your first debugging case.',
  },
  {
    id: 'perfect_rite',
    title: 'Perfect Rite',
    description: 'Solve a case for 100 points (no hints).',
  },
  {
    id: 'triple_summon',
    title: 'Triple Summon',
    description: 'Speak with all three language ghosts.',
  },
  {
    id: 'all_cases',
    title: 'Archive Cleared',
    description: 'Complete every curated mystery.',
  },
  {
    id: 'hintless_hunter',
    title: 'Hintless Hunter',
    description: 'Earn three perfect 100-point clears.',
  },
  {
    id: 'night_shift',
    title: 'Night Shift',
    description: 'Reach 250 combined best-score points.',
  },
  {
    id: 'level_five',
    title: 'Fifth Circle',
    description: 'Reach player level 5.',
  },
  {
    id: 'combo_king',
    title: 'Combo King',
    description: 'Reach a solve combo of 3.',
  },
  {
    id: 'streak_keeper',
    title: 'Streak Keeper',
    description: 'Maintain a 3-day play streak.',
  },
]

export function totalBestScore(progress: ProgressState): number {
  return Object.values(progress.bestScores).reduce((sum, n) => sum + n, 0)
}

export function perfectClearCount(progress: ProgressState): number {
  return Object.values(progress.bestScores).filter((n) => n >= 100).length
}

export function evaluateAchievements(
  progress: ProgressState,
  spokenGhosts: GhostId[],
  puzzleCount: number,
): AchievementId[] {
  const unlocked = new Set(progress.unlockedAchievements ?? [])
  const newly: AchievementId[] = []

  const unlock = (id: AchievementId) => {
    if (!unlocked.has(id)) newly.push(id)
  }

  if (progress.completedPuzzleIds.length >= 1) unlock('first_exorcism')
  if (perfectClearCount(progress) >= 1) unlock('perfect_rite')
  if (spokenGhosts.length >= 3) unlock('triple_summon')
  if (progress.completedPuzzleIds.length >= puzzleCount) unlock('all_cases')
  if (perfectClearCount(progress) >= 3) unlock('hintless_hunter')
  if (totalBestScore(progress) >= 250) unlock('night_shift')
  if ((progress.level ?? 1) >= 5) unlock('level_five')
  if ((progress.bestCombo ?? 0) >= 3) unlock('combo_king')
  if ((progress.dailyStreak ?? 0) >= 3) unlock('streak_keeper')

  return newly
}

export function spiritRank(total: number): string {
  if (total >= 400) return 'ARCHIVIST'
  if (total >= 250) return 'EXORCIST'
  if (total >= 100) return 'APPRENTICE'
  if (total >= 1) return 'INITIATE'
  return 'NOVICE'
}

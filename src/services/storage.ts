import { levelFromXp } from '../game/progression'
import type { GhostId, ProgressState, PuzzleDifficulty, TerminalMessage } from '../types'

const STORAGE_KEY = 'ghost-in-the-code:progress:v1'

const emptyStats = () => ({
  messagesSent: 0,
  hintsUsed: 0,
  wrongAnswers: 0,
  perfectSolves: 0,
  casesSolved: 0,
  sessions: 0,
})

export const defaultProgress = (): ProgressState => ({
  selectedGhost: 'cobol',
  completedPuzzleIds: [],
  bestScores: {},
  preferredDifficulty: 'any',
  conversationByGhost: {},
  unlockedAchievements: [],
  spokenGhostIds: ['cobol'],
  xp: 0,
  level: 1,
  combo: 0,
  bestCombo: 0,
  dailyStreak: 0,
  lastPlayDate: '',
  ghostAffinity: { cobol: 0, basic: 0, assembly: 0 },
  unlockedRelics: ['phosphor_core'],
  equippedRelic: 'phosphor_core',
  questProgress: {},
  completedQuests: [],
  stats: emptyStats(),
  chronicle: [],
})

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    const merged: ProgressState = {
      ...defaultProgress(),
      ...parsed,
      completedPuzzleIds: parsed.completedPuzzleIds ?? [],
      bestScores: parsed.bestScores ?? {},
      conversationByGhost: parsed.conversationByGhost ?? {},
      unlockedAchievements: parsed.unlockedAchievements ?? [],
      spokenGhostIds: parsed.spokenGhostIds?.length
        ? parsed.spokenGhostIds
        : ['cobol'],
      ghostAffinity: {
        cobol: 0,
        basic: 0,
        assembly: 0,
        ...(parsed.ghostAffinity ?? {}),
      },
      unlockedRelics: parsed.unlockedRelics?.length
        ? parsed.unlockedRelics
        : ['phosphor_core'],
      equippedRelic: parsed.equippedRelic ?? 'phosphor_core',
      questProgress: parsed.questProgress ?? {},
      completedQuests: parsed.completedQuests ?? [],
      stats: { ...emptyStats(), ...(parsed.stats ?? {}) },
      chronicle: parsed.chronicle ?? [],
    }
    const { level } = levelFromXp(merged.xp)
    merged.level = level
    return merged
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetProgress(): ProgressState {
  const next = defaultProgress()
  saveProgress(next)
  return next
}

export function setSelectedGhost(id: GhostId): ProgressState {
  const state = loadProgress()
  state.selectedGhost = id
  saveProgress(state)
  return state
}

export function setPreferredDifficulty(
  difficulty: PuzzleDifficulty | 'any',
): ProgressState {
  const state = loadProgress()
  state.preferredDifficulty = difficulty
  saveProgress(state)
  return state
}

export function saveConversation(
  ghostId: GhostId,
  messages: TerminalMessage[],
): ProgressState {
  const state = loadProgress()
  state.conversationByGhost[ghostId] = messages.slice(-40)
  saveProgress(state)
  return state
}

export function clearConversation(ghostId: GhostId): ProgressState {
  const state = loadProgress()
  state.conversationByGhost[ghostId] = []
  saveProgress(state)
  return state
}

/** Persist a full game state after engine apply. */
export function commitProgress(state: ProgressState): ProgressState {
  saveProgress(state)
  return state
}

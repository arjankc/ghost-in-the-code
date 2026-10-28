import type { GhostId, ProgressState, PuzzleDifficulty, TerminalMessage } from '../types'

const STORAGE_KEY = 'ghost-in-the-code:progress:v1'

const defaultProgress = (): ProgressState => ({
  selectedGhost: 'cobol',
  completedPuzzleIds: [],
  bestScores: {},
  preferredDifficulty: 'any',
  conversationByGhost: {},
})

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      ...defaultProgress(),
      ...parsed,
      completedPuzzleIds: parsed.completedPuzzleIds ?? [],
      bestScores: parsed.bestScores ?? {},
      conversationByGhost: parsed.conversationByGhost ?? {},
    }
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

export function recordPuzzleScore(puzzleId: string, score: number): ProgressState {
  const state = loadProgress()
  const prev = state.bestScores[puzzleId]
  state.bestScores[puzzleId] = prev === undefined ? score : Math.max(prev, score)
  if (!state.completedPuzzleIds.includes(puzzleId)) {
    state.completedPuzzleIds.push(puzzleId)
  }
  saveProgress(state)
  return state
}

export function saveConversation(
  ghostId: GhostId,
  messages: TerminalMessage[],
): ProgressState {
  const state = loadProgress()
  // Keep last 40 messages per ghost to bound storage size
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

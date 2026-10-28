export type GhostId = 'cobol' | 'basic' | 'assembly'

export type GhostCharacter = {
  id: GhostId
  displayName: string
  shortDescription: string
  systemPrompt: string
  greeting: string
  accent: string
  starters: string[]
  puzzleCategories: string[]
}

export type ChatRole = 'system' | 'user' | 'assistant' | 'system-note'

export type TerminalMessage = {
  id: string
  role: ChatRole
  content: string
  ghostId?: GhostId
  generated?: boolean
  timestamp: number
}

export type PuzzleDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type Puzzle = {
  id: string
  title: string
  difficulty: PuzzleDifficulty
  category: string
  story: string
  code: string
  task: string
  acceptedAnswers: string[]
  hints: string[]
  explanation: string
  completionMessage: string
  preferredGhost?: GhostId
}

export type RuntimeStatus = {
  runtimeAvailable: boolean
  modelInstalled: boolean
  modelName: string
  models: string[]
  temperature?: number
  numPredict?: number
  offlineCapable?: boolean
  error?: string
}

export type ProgressState = {
  selectedGhost: GhostId
  completedPuzzleIds: string[]
  bestScores: Record<string, number>
  preferredDifficulty: PuzzleDifficulty | 'any'
  conversationByGhost: Partial<Record<GhostId, TerminalMessage[]>>
}

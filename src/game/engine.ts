import { evaluateAchievements } from '../achievements/catalog'
import { puzzles } from '../puzzles/puzzles'
import type { GhostId, ProgressState } from '../types'
import {
  levelFromXp,
  todayKey,
  XP,
  yesterdayKey,
} from './progression'
import { quests } from './quests'
import { relicsUnlockedAt } from './relics'

export type GameEvent =
  | { type: 'session_start' }
  | { type: 'message'; ghostId: GhostId }
  | {
      type: 'puzzle_solved'
      puzzleId: string
      score: number
      difficulty: string
      preferredGhost?: GhostId
    }
  | { type: 'puzzle_fail' }
  | { type: 'hint_used' }
  | { type: 'ghost_summoned'; ghostId: GhostId }
  | { type: 'equip_relic'; relicId: string }

export type GameDelta = {
  state: ProgressState
  xpGained: number
  leveledUpTo: number | null
  newAchievements: string[]
  newQuests: string[]
  newRelics: string[]
  chronicle: string[]
}

function pushChronicle(state: ProgressState, text: string) {
  state.chronicle = [
    { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), text },
    ...state.chronicle,
  ].slice(0, 40)
}

function bumpQuest(state: ProgressState, id: string, amount = 1) {
  const q = quests.find((x) => x.id === id)
  if (!q || state.completedQuests.includes(id)) return
  state.questProgress[id] = Math.min(q.target, (state.questProgress[id] ?? 0) + amount)
}

function settleQuests(state: ProgressState, newly: string[], xpRef: { n: number }) {
  for (const q of quests) {
    if (state.completedQuests.includes(q.id)) continue
    const progress = state.questProgress[q.id] ?? 0
    const done =
      q.id === 'level_three'
        ? state.level >= q.target
        : q.id === 'meet_the_dead'
          ? state.spokenGhostIds.length >= q.target
          : q.id === 'streak_three'
            ? state.dailyStreak >= q.target
            : q.id === 'combo_two'
              ? state.bestCombo >= q.target
              : progress >= q.target
    if (done) {
      state.completedQuests.push(q.id)
      state.questProgress[q.id] = q.target
      xpRef.n += q.xpReward
      newly.push(q.id)
      pushChronicle(state, `Quest complete: ${q.title} (+${q.xpReward} XP)`)
    }
  }
}

function applyXp(state: ProgressState, amount: number): number | null {
  if (amount <= 0) return null
  const before = state.level
  state.xp += amount
  const { level } = levelFromXp(state.xp)
  state.level = level
  return level > before ? level : null
}

function syncRelics(state: ProgressState, newly: string[]) {
  const unlocked = relicsUnlockedAt(state.level)
  for (const id of unlocked) {
    if (!state.unlockedRelics.includes(id)) {
      state.unlockedRelics.push(id)
      newly.push(id)
      pushChronicle(state, `Relic discovered: ${id}`)
    }
  }
}

export function applyGameEvent(
  prev: ProgressState,
  event: GameEvent,
): GameDelta {
  const state: ProgressState = structuredClone(prev)
  let xpGained = 0
  const chronicle: string[] = []
  const newAchievements: string[] = []
  const newQuests: string[] = []
  const newRelics: string[] = []

  const note = (text: string) => {
    pushChronicle(state, text)
    chronicle.push(text)
  }

  if (event.type === 'session_start') {
    const today = todayKey()
    if (state.lastPlayDate !== today) {
      if (state.lastPlayDate === yesterdayKey()) state.dailyStreak += 1
      else state.dailyStreak = 1
      state.lastPlayDate = today
      xpGained += XP.daily
      note(`Day ${state.dailyStreak} vigil begins (+${XP.daily} XP)`)
    }
    state.stats.sessions += 1
    bumpQuest(state, 'streak_three', 0)
  }

  if (event.type === 'message') {
    state.stats.messagesSent += 1
    state.ghostAffinity[event.ghostId] =
      (state.ghostAffinity[event.ghostId] ?? 0) + XP.affinityMessage
    if (!state.spokenGhostIds.includes(event.ghostId)) {
      state.spokenGhostIds.push(event.ghostId)
    }
    xpGained += XP.message
    bumpQuest(state, 'first_words')
    bumpQuest(state, 'meet_the_dead', 0)
  }

  if (event.type === 'ghost_summoned') {
    if (!state.spokenGhostIds.includes(event.ghostId)) {
      state.spokenGhostIds.push(event.ghostId)
      note(`Summoned ${event.ghostId}`)
    }
    state.selectedGhost = event.ghostId
    bumpQuest(state, 'meet_the_dead', 0)
  }

  if (event.type === 'hint_used') {
    state.stats.hintsUsed += 1
    state.combo = 0
  }

  if (event.type === 'puzzle_fail') {
    state.stats.wrongAnswers += 1
    state.combo = 0
  }

  if (event.type === 'puzzle_solved') {
    const { puzzleId, score, difficulty, preferredGhost } = event
    const prevBest = state.bestScores[puzzleId]
    state.bestScores[puzzleId] =
      prevBest === undefined ? score : Math.max(prevBest, score)
    if (!state.completedPuzzleIds.includes(puzzleId)) {
      state.completedPuzzleIds.push(puzzleId)
    }
    state.stats.casesSolved += 1
    state.combo += 1
    state.bestCombo = Math.max(state.bestCombo, state.combo)
    if (score >= 100) state.stats.perfectSolves += 1

    let gain = XP.puzzleBase(score) + XP.comboBonus(state.combo)
    if (score >= 100) gain += XP.perfectBonus
    xpGained += gain

    if (preferredGhost) {
      state.ghostAffinity[preferredGhost] =
        (state.ghostAffinity[preferredGhost] ?? 0) + XP.affinityCase
    }

    bumpQuest(state, 'first_case')
    if (score >= 100) bumpQuest(state, 'perfect_clear')
    if (difficulty === 'advanced') bumpQuest(state, 'deep_stack')
    bumpQuest(state, 'combo_two', 0)

    note(
      `Exorcised ${puzzleId} for ${score} pts (combo ×${state.combo}) (+${gain} XP)`,
    )
  }

  if (event.type === 'equip_relic') {
    if (state.unlockedRelics.includes(event.relicId)) {
      state.equippedRelic = event.relicId
      note(`Equipped relic: ${event.relicId}`)
    }
  }

  // Achievements before quests so achievement XP can cascade
  const ach = evaluateAchievements(state, state.spokenGhostIds, puzzles.length)
  for (const id of ach) {
    if (!state.unlockedAchievements.includes(id)) {
      state.unlockedAchievements.push(id)
      newAchievements.push(id)
      xpGained += XP.achievement
      note(`Achievement: ${id} (+${XP.achievement} XP)`)
    }
  }

  const xpBag = { n: xpGained }
  // provisional level for level_three quest
  const provisional = levelFromXp(state.xp + xpBag.n).level
  state.level = Math.max(state.level, provisional)
  settleQuests(state, newQuests, xpBag)
  xpGained = xpBag.n

  const leveledUpTo = applyXp(state, xpGained)
  if (leveledUpTo) {
    note(`Level up! You are now level ${leveledUpTo}`)
    bumpQuest(state, 'level_three', 0)
    settleQuests(state, newQuests, { n: 0 })
  }

  // Recompute level from total XP to stay consistent
  const final = levelFromXp(state.xp)
  state.level = final.level
  syncRelics(state, newRelics)
  if (!state.equippedRelic && state.unlockedRelics.length) {
    state.equippedRelic = state.unlockedRelics[0] ?? 'phosphor_core'
  }

  return {
    state,
    xpGained,
    leveledUpTo,
    newAchievements,
    newQuests,
    newRelics,
    chronicle,
  }
}

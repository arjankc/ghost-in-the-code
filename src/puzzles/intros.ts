import { getCharacter } from '../characters'
import type { GhostId, Puzzle } from '../types'

/** Curated in-character case openings — not model-generated. */
const BY_GHOST: Record<GhostId, (puzzle: Puzzle) => string> = {
  cobol: (p) =>
    `Case file opened: “${p.title}”. We will proceed methodically. Inspect the defect, state a precise correction, and avoid fashionable guesses.`,
  basic: (p) =>
    `Ooh — a new mystery! “${p.title}”. Read the broken bit carefully. Mistakes are clues, and hints are lanterns, not spoilers if you can help it!`,
  assembly: (p) =>
    `Case: ${p.title}. Observe state. Trace the instruction path. One wrong flag poisons the run. Speak the fix precisely.`,
}

export function puzzleIntro(puzzle: Puzzle, selectedGhost: GhostId): {
  ghostId: GhostId
  text: string
} {
  const ghostId = puzzle.preferredGhost ?? selectedGhost
  const text = BY_GHOST[ghostId](puzzle)
  return { ghostId, text }
}

export function puzzleIntroLabel(ghostId: GhostId): string {
  return getCharacter(ghostId).displayName
}

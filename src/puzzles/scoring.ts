/** Deterministic scoring — AI never decides the score. */
export function scoreForHints(hintsUsed: number): number {
  if (hintsUsed <= 0) return 100
  if (hintsUsed === 1) return 75
  if (hintsUsed === 2) return 50
  return 25
}

export function mergeBestScore(
  previous: number | undefined,
  next: number,
): number {
  if (previous === undefined) return next
  return Math.max(previous, next)
}

export function xpForLevel(level: number): number {
  // XP required to go from `level` → `level + 1`
  return 35 + Math.max(0, level - 1) * 28
}

export function levelFromXp(xp: number): { level: number; into: number; need: number } {
  let level = 1
  let remaining = Math.max(0, xp)
  while (remaining >= xpForLevel(level) && level < 99) {
    remaining -= xpForLevel(level)
    level += 1
  }
  return { level, into: remaining, need: xpForLevel(level) }
}

export function titleForLevel(level: number): string {
  if (level >= 20) return 'MACHINE MYTH'
  if (level >= 15) return 'ARCHIVE WARDEN'
  if (level >= 10) return 'BUGBANISHER'
  if (level >= 7) return 'STACK WALKER'
  if (level >= 5) return 'EXORCIST'
  if (level >= 3) return 'APPRENTICE'
  if (level >= 2) return 'INITIATE'
  return 'NOVICE'
}

export const XP = {
  message: 6,
  puzzleBase: (score: number) => Math.round(score * 0.55),
  perfectBonus: 30,
  comboBonus: (combo: number) => Math.min(40, combo * 8),
  achievement: 18,
  quest: 45,
  daily: 12,
  affinityMessage: 8,
  affinityCase: 22,
} as const

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function yesterdayKey(d = new Date()): string {
  const y = new Date(d)
  y.setDate(y.getDate() - 1)
  return y.toISOString().slice(0, 10)
}

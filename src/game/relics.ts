export type RelicId =
  | 'phosphor_core'
  | 'amber_ledger'
  | 'violet_register'
  | 'crt_heart'
  | 'bug_jar'
  | 'midnight_disk'

export type Relic = {
  id: RelicId
  name: string
  blurb: string
  unlockLevel: number
  theme: {
    phosphor: string
    amber: string
    violet: string
    glow: string
  }
}

export const relics: Relic[] = [
  {
    id: 'phosphor_core',
    name: 'Phosphor Core',
    blurb: 'Default haunt. Steady green afterglow.',
    unlockLevel: 1,
    theme: {
      phosphor: '#7dff9a',
      amber: '#d4a017',
      violet: '#8b6cc7',
      glow: '0 0 12px rgba(125, 255, 154, 0.25)',
    },
  },
  {
    id: 'amber_ledger',
    name: 'Amber Ledger',
    blurb: 'COBOL’s favorite glow — warm audit light.',
    unlockLevel: 3,
    theme: {
      phosphor: '#f0c14a',
      amber: '#ffb347',
      violet: '#c9a227',
      glow: '0 0 14px rgba(240, 193, 74, 0.3)',
    },
  },
  {
    id: 'violet_register',
    name: 'Violet Register',
    blurb: 'Assembly’s hush — purple machine dusk.',
    unlockLevel: 5,
    theme: {
      phosphor: '#c4a7ff',
      amber: '#e0a0ff',
      violet: '#9b7bff',
      glow: '0 0 14px rgba(155, 123, 255, 0.35)',
    },
  },
  {
    id: 'crt_heart',
    name: 'CRT Heart',
    blurb: 'Cyan pulse of a machine that refuses to die.',
    unlockLevel: 7,
    theme: {
      phosphor: '#5dfff0',
      amber: '#7ec8e3',
      violet: '#4fd1c5',
      glow: '0 0 16px rgba(93, 255, 240, 0.35)',
    },
  },
  {
    id: 'bug_jar',
    name: 'Bug Jar',
    blurb: 'Caught defects shimmer rose-red behind glass.',
    unlockLevel: 4,
    theme: {
      phosphor: '#ff8fab',
      amber: '#ff6b6b',
      violet: '#c44569',
      glow: '0 0 14px rgba(255, 143, 171, 0.3)',
    },
  },
  {
    id: 'midnight_disk',
    name: 'Midnight Disk',
    blurb: 'Cold blue of offline storage at 3 a.m.',
    unlockLevel: 10,
    theme: {
      phosphor: '#7eb6ff',
      amber: '#5b8def',
      violet: '#3d5afe',
      glow: '0 0 16px rgba(126, 182, 255, 0.35)',
    },
  },
]

export function relicById(id: string | null | undefined): Relic {
  return relics.find((r) => r.id === id) ?? relics[0]!
}

export function relicsUnlockedAt(level: number): RelicId[] {
  return relics.filter((r) => r.unlockLevel <= level).map((r) => r.id)
}

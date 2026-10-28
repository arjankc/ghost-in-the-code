export type QuestId =
  | 'first_words'
  | 'first_case'
  | 'perfect_clear'
  | 'level_three'
  | 'meet_the_dead'
  | 'deep_stack'
  | 'combo_two'
  | 'streak_three'

export type Quest = {
  id: QuestId
  title: string
  description: string
  target: number
  xpReward: number
}

export const quests: Quest[] = [
  {
    id: 'first_words',
    title: 'First Words',
    description: 'Send 3 messages to any ghost.',
    target: 3,
    xpReward: 40,
  },
  {
    id: 'first_case',
    title: 'First Case',
    description: 'Exorcise any debugging mystery.',
    target: 1,
    xpReward: 50,
  },
  {
    id: 'perfect_clear',
    title: 'Clean Compile',
    description: 'Solve a case with 100 points (no hints).',
    target: 1,
    xpReward: 60,
  },
  {
    id: 'level_three',
    title: 'Rising Spirit',
    description: 'Reach player level 3.',
    target: 3,
    xpReward: 55,
  },
  {
    id: 'meet_the_dead',
    title: 'Meet the Dead',
    description: 'Summon all three language ghosts.',
    target: 3,
    xpReward: 70,
  },
  {
    id: 'deep_stack',
    title: 'Deep Stack',
    description: 'Complete an advanced case.',
    target: 1,
    xpReward: 80,
  },
  {
    id: 'combo_two',
    title: 'Combo Rite',
    description: 'Reach a solve combo of 2.',
    target: 2,
    xpReward: 45,
  },
  {
    id: 'streak_three',
    title: 'Night Vigil',
    description: 'Keep a 3-day play streak.',
    target: 3,
    xpReward: 90,
  },
]

export function questById(id: string): Quest | undefined {
  return quests.find((q) => q.id === id)
}

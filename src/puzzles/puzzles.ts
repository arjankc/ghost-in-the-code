import type { Puzzle } from '../types'

export const puzzles: Puzzle[] = [
  {
    id: 'off-by-one-lanterns',
    title: 'The Off-By-One Lanterns',
    difficulty: 'beginner',
    category: 'loops',
    preferredGhost: 'basic',
    story:
      'A caretaker program lights lanterns for days 1 through 10. Something in the loop leaves the last night dark.',
    code: `count = 0
day = 1
WHILE day < 10
  light_lantern(day)
  count = count + 1
  day = day + 1
END
# Expected: 10 lanterns lit. Actual: 9.`,
    task: 'What should the WHILE condition be so days 1 through 10 are lit? Reply with the corrected condition only (example: day <= 10).',
    acceptedAnswers: [
      'day <= 10',
      'while day <= 10',
      'day < 11',
      'while day < 11',
    ],
    hints: [
      'Count how many times the body runs when the condition is `day < 10` starting at day = 1.',
      'Inclusive ranges often need `<=` (or an exclusive upper bound one past the last value).',
      'Days 1..10 inclusive means the loop must still run when day is 10.',
    ],
    explanation:
      'With `day < 10`, the loop runs for days 1–9 only. Changing to `day <= 10` (or `day < 11`) includes day 10.',
    completionMessage:
      'The tenth lantern flares. The off-by-one spirit loosens its grip.',
  },
  {
    id: 'inverted-gate',
    title: 'The Inverted Gate',
    difficulty: 'beginner',
    category: 'conditionals',
    preferredGhost: 'cobol',
    story:
      'A vault should open only for clearance level 5 or higher. Right now it opens for everyone else instead.',
    code: `IF clearance < 5 THEN
  open_vault()
ELSE
  deny_access()
END`,
    task: 'Write the corrected IF condition that opens the vault when clearance is at least 5. Reply with the condition only (example: clearance >= 5).',
    acceptedAnswers: [
      'clearance >= 5',
      'clearance > 4',
      'if clearance >= 5',
      'if clearance > 4',
    ],
    hints: [
      'The current condition opens the vault when clearance is *below* 5.',
      '“At least 5” means greater than or equal to 5.',
      'Flip the comparison (and keep the open/deny branches matching the new meaning).',
    ],
    explanation:
      'The original condition treated low clearance as success. Use `clearance >= 5` (or equivalent) for the open path.',
    completionMessage:
      'The gate accepts the proper clearance. The ledger marks the case closed.',
  },
  {
    id: 'uninitialized-sum',
    title: 'The Uninitialized Sum',
    difficulty: 'beginner',
    category: 'initialization',
    preferredGhost: 'cobol',
    story:
      'A ritual totals offerings, but the running total starts haunted — sometimes huge, sometimes negative — before any values are added.',
    code: `# total is never set before the loop
FOR each offering in offerings
  total = total + offering
END
PRINT total`,
    task: 'What single initialization line should appear before the loop? Reply with that line (example: total = 0).',
    acceptedAnswers: [
      'total = 0',
      'total := 0',
      'set total = 0',
      'total = 0 before the loop',
    ],
    hints: [
      'Adding to a variable that was never given a starting value is undefined behavior in many languages.',
      'A sum usually begins at zero before accumulation.',
      'Place `total = 0` before the FOR loop.',
    ],
    explanation:
      'Without initializing `total`, the first addition uses garbage or leftover state. Start with `total = 0`.',
    completionMessage:
      'The sum settles to zero before the first offering. Order returns to the ritual.',
  },
  {
    id: 'stale-flag',
    title: 'The Stale Flag',
    difficulty: 'intermediate',
    category: 'state',
    preferredGhost: 'assembly',
    story:
      'A watcher sets `found = true` when it sees a marker, but later searches always report “found” even in empty rooms.',
    code: `found = false
FOR each room in dungeon
  IF room.has_marker THEN
    found = true
  END
  # missing reset for the next independent search
END
# Later, a new search reuses found without clearing it.`,
    task: 'Before each new independent search, what should happen to `found`? Reply with a short phrase or line (example: reset found to false).',
    acceptedAnswers: [
      'reset found to false',
      'found = false',
      'set found = false',
      'clear found',
      'reinitialize found to false',
      'found = false before each search',
    ],
    hints: [
      'Once `found` becomes true, it stays true unless something changes it back.',
      'State that survives across searches causes false positives.',
      'Reinitialize the flag to false at the start of every new search.',
    ],
    explanation:
      'Sticky state from a previous success poisons later runs. Reset `found = false` before each independent search.',
    completionMessage:
      'The flag clears. Registers remember only the current hunt.',
  },
  {
    id: 'wrong-average',
    title: 'The Flawed Average',
    difficulty: 'intermediate',
    category: 'algorithms',
    preferredGhost: 'basic',
    story:
      'A spirit averages three readings but divides by the wrong count, always reporting a number that feels too large.',
    code: `a = 10
b = 20
c = 30
average = (a + b + c) / 2
# Expected average of three values: 20`,
    task: 'What is the corrected assignment for average? Reply with the full assignment (example: average = (a + b + c) / 3).',
    acceptedAnswers: [
      'average = (a + b + c) / 3',
      'average=(a+b+c)/3',
      'avg = (a + b + c) / 3',
    ],
    hints: [
      'An average of n values divides the sum by n.',
      'There are three readings: a, b, and c.',
      'Replace the divisor 2 with 3.',
    ],
    explanation:
      'Dividing by 2 treats the sum as if there were only two values. Use `/ 3` for three readings.',
    completionMessage:
      'The average settles at twenty. The flawed divisor dissolves into static.',
  },
]

export function getPuzzle(id: string): Puzzle | undefined {
  return puzzles.find((p) => p.id === id)
}

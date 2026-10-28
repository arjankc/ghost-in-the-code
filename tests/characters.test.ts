import { describe, expect, it } from 'vitest'
import { characters, getCharacter } from '../src/characters'
import { puzzles } from '../src/puzzles/puzzles'

describe('characters', () => {
  it('includes three distinct ghosts', () => {
    expect(characters).toHaveLength(3)
    expect(new Set(characters.map((c) => c.id)).size).toBe(3)
  })

  it('has required config fields', () => {
    for (const ghost of characters) {
      expect(ghost.displayName).toBeTruthy()
      expect(ghost.systemPrompt.length).toBeGreaterThan(40)
      expect(ghost.greeting).toBeTruthy()
      expect(ghost.starters.length).toBeGreaterThan(0)
      expect(ghost.accent).toMatch(/^#/)
    }
  })

  it('loads by id', () => {
    expect(getCharacter('cobol').id).toBe('cobol')
  })
})

describe('puzzles', () => {
  it('ships at least three playable cases', () => {
    expect(puzzles.length).toBeGreaterThanOrEqual(3)
  })

  it('has deterministic answers and hints', () => {
    for (const puzzle of puzzles) {
      expect(puzzle.acceptedAnswers.length).toBeGreaterThan(0)
      expect(puzzle.hints.length).toBeGreaterThan(0)
      expect(puzzle.code).toBeTruthy()
    }
  })
})

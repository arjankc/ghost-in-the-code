import type { GhostCharacter, GhostId } from '../types'
import { assembly } from './assembly'
import { basic } from './basic'
import { cobol } from './cobol'

export const characters: GhostCharacter[] = [cobol, basic, assembly]

export const charactersById: Record<GhostId, GhostCharacter> = {
  cobol,
  basic,
  assembly,
}

export function getCharacter(id: GhostId): GhostCharacter {
  return charactersById[id]
}

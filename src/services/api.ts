import type { GhostId, RuntimeStatus, TerminalMessage } from '../types'
import { getCharacter } from '../characters'
import { config as clientDefaults } from '../utils/clientConfig'

export class ApiError extends Error {
  code?: string
  status: number

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const data = (await res.json()) as { error?: string; code?: string }
    return new ApiError(
      data.error ?? `Request failed (${res.status})`,
      res.status,
      data.code,
    )
  } catch {
    return new ApiError(`Request failed (${res.status})`, res.status)
  }
}

export async function fetchStatus(): Promise<RuntimeStatus> {
  const res = await fetch('/api/status')
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as RuntimeStatus
}

export async function runTestPrompt(): Promise<{
  ok: boolean
  reply?: string
  error?: string
}> {
  const res = await fetch('/api/test-prompt', { method: 'POST' })
  const data = (await res.json()) as {
    ok: boolean
    reply?: string
    error?: string
  }
  return data
}

export async function sendChat(options: {
  ghostId: GhostId
  history: TerminalMessage[]
  userMessage: string
  mode?: 'chat' | 'hint'
  puzzleContext?: string
}): Promise<{ content: string; model: string; disclaimer: string }> {
  const ghost = getCharacter(options.ghostId)
  const systemParts = [ghost.systemPrompt]
  if (options.mode === 'hint' && options.puzzleContext) {
    systemParts.push(
      'The player is solving a curated debugging puzzle. Offer a Socratic hint — do not give the final answer unless they already stated it. Keep the hint short.',
      `Puzzle context:\n${options.puzzleContext}`,
    )
  }
  systemParts.push(
    'Disclaimer reminder: you are a fictional character inspired by computing history.',
  )

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemParts.join('\n\n') },
  ]

  const prior = options.history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-clientDefaults.maxClientHistory)

  for (const msg of prior) {
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })
  }

  messages.push({ role: 'user', content: options.userMessage })

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      characterId: options.ghostId,
      messages,
    }),
  })

  if (!res.ok) throw await parseError(res)

  return (await res.json()) as {
    content: string
    model: string
    disclaimer: string
  }
}

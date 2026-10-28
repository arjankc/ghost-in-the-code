import { config } from './config.ts'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type RuntimeStatus = {
  runtimeAvailable: boolean
  modelInstalled: boolean
  modelName: string
  models: string[]
  error?: string
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = config.timeoutMs,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function getRuntimeStatus(): Promise<RuntimeStatus> {
  try {
    const res = await fetchWithTimeout(
      `${config.ollamaBaseUrl}/api/tags`,
      { method: 'GET' },
      8_000,
    )
    if (!res.ok) {
      return {
        runtimeAvailable: false,
        modelInstalled: false,
        modelName: config.ollamaModel,
        models: [],
        error: `Ollama responded with HTTP ${res.status}`,
      }
    }
    const data = (await res.json()) as {
      models?: Array<{ name?: string; model?: string }>
    }
    const models = (data.models ?? [])
      .map((m) => m.name ?? m.model ?? '')
      .filter(Boolean)

    const target = config.ollamaModel
    const [family, tag = 'latest'] = target.split(':')
    const modelInstalled = models.some((name) => {
      if (name === target) return true
      const [nFamily, nTag = 'latest'] = name.split(':')
      return nFamily === family && nTag === tag
    })

    return {
      runtimeAvailable: true,
      modelInstalled,
      modelName: config.ollamaModel,
      models,
    }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Timed out reaching Ollama'
          : err.message
        : 'Unknown error contacting Ollama'
    return {
      runtimeAvailable: false,
      modelInstalled: false,
      modelName: config.ollamaModel,
      models: [],
      error: message,
    }
  }
}

export async function chat(
  messages: ChatMessage[],
): Promise<{ content: string; model: string }> {
  const res = await fetchWithTimeout(`${config.ollamaBaseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.ollamaModel,
      messages,
      stream: false,
      options: {
        temperature: config.temperature,
        num_predict: config.numPredict,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `Ollama chat failed (HTTP ${res.status})${body ? `: ${body.slice(0, 200)}` : ''}`,
    )
  }

  const data = (await res.json()) as {
    message?: { content?: string }
    model?: string
  }

  const content = data.message?.content?.trim()
  if (!content) {
    throw new Error('Ollama returned an empty response')
  }

  return { content, model: data.model ?? config.ollamaModel }
}

export async function testPrompt(): Promise<{ ok: boolean; reply?: string; error?: string }> {
  try {
    const result = await chat([
      {
        role: 'system',
        content:
          'You are a brief haunted terminal spirit. Reply in one short spooky sentence.',
      },
      { role: 'user', content: 'Say hello from the haunted machine.' },
    ])
    return { ok: true, reply: result.content }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Test prompt failed',
    }
  }
}

import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.ts'
import { chat, getRuntimeStatus, testPrompt } from './ollamaAdapter.ts'
import type { ChatMessage } from './ollamaAdapter.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(
  cors({
    origin: [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      `http://127.0.0.1:${config.port}`,
      `http://localhost:${config.port}`,
    ],
  }),
)
app.use(express.json({ limit: '32kb' }))

function clampHistory(messages: ChatMessage[]): ChatMessage[] {
  const system = messages.filter((m) => m.role === 'system')
  const rest = messages.filter((m) => m.role !== 'system')
  const trimmed = rest.slice(-config.maxHistoryMessages)
  return [...system.slice(0, 1), ...trimmed]
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'Ghost in the Code',
    version: '1.0.0',
    localOnly: true,
  })
})

app.get('/api/status', async (_req, res) => {
  const status = await getRuntimeStatus()
  res.json({
    ...status,
    temperature: config.temperature,
    numPredict: config.numPredict,
    ollamaBaseUrl: 'http://127.0.0.1:11434',
    offlineCapable:
      status.runtimeAvailable && status.modelInstalled,
  })
})

app.post('/api/test-prompt', async (_req, res) => {
  const status = await getRuntimeStatus()
  if (!status.runtimeAvailable) {
    res.status(503).json({
      ok: false,
      error:
        'Ollama is not reachable. Install and start Ollama, then retry.',
    })
    return
  }
  if (!status.modelInstalled) {
    res.status(503).json({
      ok: false,
      error: `Model "${config.ollamaModel}" is not installed. Run: ollama pull ${config.ollamaModel}`,
    })
    return
  }
  const result = await testPrompt()
  res.status(result.ok ? 200 : 502).json(result)
})

app.post('/api/chat', async (req, res) => {
  const { messages, characterId } = req.body as {
    messages?: unknown
    characterId?: unknown
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages must be a non-empty array' })
    return
  }

  if (typeof characterId !== 'string' || !characterId.trim()) {
    res.status(400).json({ error: 'characterId is required' })
    return
  }

  const normalized: ChatMessage[] = []
  for (const raw of messages) {
    if (!raw || typeof raw !== 'object') {
      res.status(400).json({ error: 'invalid message entry' })
      return
    }
    const role = (raw as { role?: unknown }).role
    const content = (raw as { content?: unknown }).content
    if (
      role !== 'system' &&
      role !== 'user' &&
      role !== 'assistant'
    ) {
      res.status(400).json({ error: 'invalid message role' })
      return
    }
    if (typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'message content must be a non-empty string' })
      return
    }
    if (content.length > config.maxMessageChars) {
      res.status(400).json({
        error: `message exceeds ${config.maxMessageChars} characters`,
      })
      return
    }
    normalized.push({ role, content: content.trim() })
  }

  const status = await getRuntimeStatus()
  if (!status.runtimeAvailable) {
    res.status(503).json({
      error:
        'Local AI runtime unavailable. Start Ollama on this machine, then retry.',
      code: 'RUNTIME_UNAVAILABLE',
    })
    return
  }
  if (!status.modelInstalled) {
    res.status(503).json({
      error: `Model "${config.ollamaModel}" is not installed. Run: ollama pull ${config.ollamaModel}`,
      code: 'MODEL_MISSING',
    })
    return
  }

  try {
    const result = await chat(clampHistory(normalized))
    res.json({
      content: result.content,
      model: result.model,
      characterId,
      generated: true,
      disclaimer:
        'Fictional AI dialogue inspired by computing history — not a verified historical record.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat failed'
    res.status(502).json({ error: message, code: 'INFERENCE_FAILED' })
  }
})

const distPath = path.resolve(__dirname, '../dist')
app.use(express.static(distPath))
app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    next()
    return
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend not built. Run npm run build or npm run dev.')
    }
  })
})

app.listen(config.port, config.host, () => {
  console.log(
    `[ghost] API listening on http://${config.host}:${config.port}`,
  )
  console.log(`[ghost] Model: ${config.ollamaModel}`)
  console.log(`[ghost] Ollama: ${config.ollamaBaseUrl}`)
})

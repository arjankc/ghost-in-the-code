import 'dotenv/config'

export const config = {
  host: process.env.HOST ?? '127.0.0.1',
  port: Number(process.env.PORT ?? 8787),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
  ollamaModel: process.env.OLLAMA_MODEL ?? 'qwen2.5:1.5b',
  temperature: Number(process.env.OLLAMA_TEMPERATURE ?? 0.7),
  numPredict: Number(process.env.OLLAMA_NUM_PREDICT ?? 256),
  timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS ?? 120_000),
  maxHistoryMessages: Number(process.env.MAX_HISTORY_MESSAGES ?? 12),
  maxMessageChars: 4_000,
} as const

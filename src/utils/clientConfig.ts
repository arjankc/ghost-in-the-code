export const config = {
  maxClientHistory: 10,
  appName: 'Ghost in the Code',
  tagline: 'Every language leaves a ghost behind.',
  version: '1.0.0',
} as const

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

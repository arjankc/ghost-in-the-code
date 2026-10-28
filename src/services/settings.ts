const KEY = 'ghost-in-the-code:settings:v1'

export type AppSettings = {
  soundMuted: boolean
  ambientOn: boolean
  reducedMotion: boolean
}

const defaults = (): AppSettings => ({
  soundMuted: false,
  ambientOn: true,
  reducedMotion: false,
})

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaults()
    return { ...defaults(), ...(JSON.parse(raw) as Partial<AppSettings>) }
  } catch {
    return defaults()
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings))
}

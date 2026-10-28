/** Procedural SFX via Web Audio — no audio files, works fully offline. */

type OscType = OscillatorType

let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambientNodes: { stop: () => void } | null = null
let unlocked = false
let muted = false
let ambientEnabled = true

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 0.55
    master.connect(ctx.destination)
  }
  return ctx
}

export async function unlockAudio(): Promise<void> {
  const audio = ensureCtx()
  if (!audio) return
  if (audio.state === 'suspended') {
    await audio.resume()
  }
  unlocked = true
  if (ambientEnabled && !muted) startAmbient()
}

export function isAudioUnlocked(): boolean {
  return unlocked
}

export function setMuted(next: boolean): void {
  muted = next
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 0.55, ctx.currentTime, 0.05)
  }
  if (next) stopAmbient()
  else if (unlocked && ambientEnabled) startAmbient()
}

export function setAmbientEnabled(next: boolean): void {
  ambientEnabled = next
  if (!next) stopAmbient()
  else if (unlocked && !muted) startAmbient()
}

export function getMuted(): boolean {
  return muted
}

export function getAmbientEnabled(): boolean {
  return ambientEnabled
}

function tone(
  freq: number,
  dur: number,
  type: OscType = 'sine',
  gain = 0.14,
  delay = 0,
): void {
  if (muted) return
  const audio = ensureCtx()
  if (!audio || !master || !unlocked) return
  const t = audio.currentTime + delay
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, 0.04))
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function noiseBurst(dur: number, gain: number, lowpass: number): void {
  if (muted) return
  const audio = ensureCtx()
  if (!audio || !master || !unlocked) return
  const frames = Math.floor(audio.sampleRate * dur)
  const buf = audio.createBuffer(1, frames, audio.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  }
  const src = audio.createBufferSource()
  src.buffer = buf
  const filt = audio.createBiquadFilter()
  filt.type = 'lowpass'
  filt.frequency.value = lowpass
  const g = audio.createGain()
  const t = audio.currentTime
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filt).connect(g).connect(master)
  src.start()
}

export function startAmbient(): void {
  if (muted || !ambientEnabled || ambientNodes) return
  const audio = ensureCtx()
  if (!audio || !master || !unlocked) return

  const oscA = audio.createOscillator()
  const oscB = audio.createOscillator()
  const g = audio.createGain()
  const filt = audio.createBiquadFilter()
  filt.type = 'lowpass'
  filt.frequency.value = 280
  oscA.type = 'sine'
  oscB.type = 'triangle'
  oscA.frequency.value = 55
  oscB.frequency.value = 82.5
  g.gain.value = 0.028
  oscA.connect(filt)
  oscB.connect(filt)
  filt.connect(g).connect(master)
  oscA.start()
  oscB.start()

  // Soft crackle
  const crackleInterval = window.setInterval(() => {
    if (muted || !ambientEnabled) return
    if (Math.random() > 0.7) noiseBurst(0.04, 0.02, 1200)
  }, 1800)

  ambientNodes = {
    stop: () => {
      window.clearInterval(crackleInterval)
      try {
        oscA.stop()
        oscB.stop()
      } catch {
        /* already stopped */
      }
      g.disconnect()
    },
  }
}

export function stopAmbient(): void {
  ambientNodes?.stop()
  ambientNodes = null
}

export const sfx = {
  boot() {
    tone(120, 0.2, 'sawtooth', 0.08)
    tone(240, 0.25, 'triangle', 0.1, 0.12)
    tone(480, 0.35, 'sine', 0.12, 0.28)
  },
  click() {
    tone(880, 0.04, 'square', 0.05)
  },
  type() {
    tone(640 + Math.random() * 80, 0.025, 'square', 0.035)
  },
  send() {
    tone(520, 0.07, 'triangle', 0.1)
    tone(780, 0.09, 'sine', 0.08, 0.05)
  },
  think() {
    tone(180, 0.15, 'sine', 0.05)
    tone(190, 0.15, 'sine', 0.04, 0.08)
  },
  reply() {
    tone(330, 0.1, 'triangle', 0.09)
    tone(440, 0.12, 'sine', 0.08, 0.07)
    noiseBurst(0.08, 0.04, 2000)
  },
  summon() {
    noiseBurst(0.2, 0.1, 700)
    tone(110, 0.3, 'sawtooth', 0.08)
    tone(220, 0.35, 'triangle', 0.1, 0.1)
    tone(440, 0.4, 'sine', 0.09, 0.22)
  },
  hint() {
    tone(494, 0.1, 'sine', 0.08)
    tone(370, 0.14, 'triangle', 0.07, 0.08)
  },
  wrong() {
    tone(180, 0.12, 'sawtooth', 0.1)
    tone(140, 0.18, 'square', 0.08, 0.06)
    noiseBurst(0.12, 0.08, 500)
  },
  correct() {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'sine', 0.12, i * 0.1))
  },
  error() {
    tone(90, 0.25, 'sawtooth', 0.1)
    noiseBurst(0.2, 0.12, 400)
  },
  toggle() {
    tone(700, 0.05, 'triangle', 0.06)
  },
}

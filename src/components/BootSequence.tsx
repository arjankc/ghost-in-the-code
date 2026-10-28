import { useEffect, useState } from 'react'
import { sfx, unlockAudio } from '../services/audio'

type Props = {
  onDone: () => void
  reducedMotion?: boolean
}

const LINES = [
  'COLD BOOT // HAUNTED MACHINE',
  'MOUNTING LOCAL SPIRIT RUNTIME…',
  'SCANNING ABANDONED LANGUAGE FRAGMENTS…',
  'COBOL… BASIC… ASSEMBLY… DETECTED',
  'NO CLOUD LINK REQUIRED',
  'PRESS ANY KEY — OR CLICK — TO ENTER',
]

export function BootSequence({ onDone, reducedMotion }: Props) {
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (reducedMotion) {
      setVisible(LINES.length)
      return
    }
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setVisible(i)
      if (i >= LINES.length) window.clearInterval(id)
    }, 420)
    return () => window.clearInterval(id)
  }, [reducedMotion])

  async function enter() {
    await unlockAudio()
    sfx.boot()
    onDone()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (visible < LINES.length && !reducedMotion) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        void enter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, reducedMotion])

  const ready = reducedMotion || visible >= LINES.length

  return (
    <div className="boot-screen" role="dialog" aria-label="Boot sequence">
      <div className="boot-logo" aria-hidden>
        <span className="boot-skull">◈</span>
        <div className="boot-rings" />
      </div>
      <pre className="boot-log">
        {LINES.slice(0, visible).map((line) => (
          <div key={line} className="boot-line">
            {line}
          </div>
        ))}
        {!ready ? <span className="boot-cursor">█</span> : null}
      </pre>
      {ready ? (
        <button type="button" className="btn primary boot-enter" onClick={() => void enter()}>
          ENTER THE TERMINAL
        </button>
      ) : null}
    </div>
  )
}

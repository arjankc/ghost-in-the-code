import { useEffect, useState } from 'react'

type Props = {
  text: string
  active?: boolean
  cps?: number
  className?: string
  onDone?: () => void
}

export function TypewriterText({
  text,
  active = true,
  cps = 48,
  className,
  onDone,
}: Props) {
  const [shown, setShown] = useState(active ? '' : text)

  useEffect(() => {
    if (!active) {
      setShown(text)
      return
    }
    setShown('')
    let i = 0
    const step = Math.max(1, Math.floor(1000 / cps))
    const id = window.setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) {
        window.clearInterval(id)
        onDone?.()
      }
    }, step)
    return () => window.clearInterval(id)
  }, [text, active, cps, onDone])

  return (
    <span className={className}>
      {shown}
      {active && shown.length < text.length ? (
        <span className="tw-caret" aria-hidden>
          █
        </span>
      ) : null}
    </span>
  )
}

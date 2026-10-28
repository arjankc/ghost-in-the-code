import { useMemo } from 'react'

type Props = {
  accent: string
  thinking?: boolean
  glitch?: boolean
  reducedMotion?: boolean
}

export function FxLayer({ accent, thinking, glitch, reducedMotion }: Props) {
  const motes = useMemo(
    () =>
      Array.from({ length: reducedMotion ? 0 : 18 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 7) * 0.45}s`,
        dur: `${6 + (i % 5)}s`,
        size: 2 + (i % 3),
      })),
    [reducedMotion],
  )

  return (
    <div
      className={`fx-layer ${thinking ? 'fx-layer--thinking' : ''} ${glitch ? 'fx-layer--glitch' : ''}`}
      style={{ ['--ghost-accent' as string]: accent }}
      aria-hidden
    >
      <div className="fx-vignette" />
      <div className="fx-noise" />
      {motes.map((m) => (
        <span
          key={m.id}
          className="fx-mote"
          style={{
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.dur,
            width: m.size,
            height: m.size,
          }}
        />
      ))}
      {thinking ? <div className="fx-think-beam" /> : null}
    </div>
  )
}

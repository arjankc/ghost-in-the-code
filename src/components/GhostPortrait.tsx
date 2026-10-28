import { useId } from 'react'
import type { GhostId } from '../types'

type Props = {
  id: GhostId
  accent: string
  size?: number
  animate?: boolean
  className?: string
}

export function GhostPortrait({
  id,
  accent,
  size = 72,
  animate = true,
  className = '',
}: Props) {
  const uid = useId().replace(/:/g, '')
  const auraId = `aura-${id}-${uid}`
  const softId = `soft-${id}-${uid}`

  return (
    <svg
      className={`ghost-portrait ${animate ? 'ghost-portrait--live' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      aria-hidden
      style={{ ['--ghost-accent' as string]: accent }}
    >
      <defs>
        <radialGradient id={auraId} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <filter id={softId}>
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <circle cx="48" cy="48" r="44" fill={`url(#${auraId})`} className="ghost-aura" />

      {/* Body */}
      <path
        className="ghost-body"
        fill={accent}
        fillOpacity="0.22"
        stroke={accent}
        strokeWidth="2"
        d="M24 38c0-13 10-24 24-24s24 11 24 24v28c0 2-1.5 3-3 2l-5-3-5 4-5-4-5 4-5-4-5 3c-1.5 1-3 0-3-2V38z"
      />

      {/* Face variants */}
      {id === 'cobol' && (
        <>
          <rect x="34" y="40" width="10" height="6" rx="1" fill={accent} opacity="0.85" />
          <rect x="52" y="40" width="10" height="6" rx="1" fill={accent} opacity="0.85" />
          <path
            d="M38 58h20"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="square"
          />
          <text
            x="48"
            y="30"
            textAnchor="middle"
            fill={accent}
            fontSize="7"
            fontFamily="monospace"
            opacity="0.8"
          >
            01
          </text>
        </>
      )}

      {id === 'basic' && (
        <>
          <circle cx="38" cy="44" r="4" fill={accent} />
          <circle cx="58" cy="44" r="4" fill={accent} />
          <path
            d="M36 56c4 6 20 6 24 0"
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text
            x="48"
            y="30"
            textAnchor="middle"
            fill={accent}
            fontSize="8"
            fontFamily="monospace"
            opacity="0.85"
          >
            10
          </text>
        </>
      )}

      {id === 'assembly' && (
        <>
          <path d="M34 42h8l-4 8z" fill={accent} />
          <path d="M54 42h8l-4 8z" fill={accent} />
          <rect x="40" y="56" width="16" height="3" fill={accent} opacity="0.9" />
          <text
            x="48"
            y="30"
            textAnchor="middle"
            fill={accent}
            fontSize="7"
            fontFamily="monospace"
            opacity="0.85"
          >
            AX
          </text>
        </>
      )}

      <ellipse
        className="ghost-sheen"
        cx="40"
        cy="34"
        rx="10"
        ry="5"
        fill="#fff"
        opacity="0.12"
        filter={`url(#${softId})`}
      />
    </svg>
  )
}

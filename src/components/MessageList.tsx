import { useEffect, useRef } from 'react'
import { getCharacter } from '../characters'
import type { TerminalMessage } from '../types'
import { GhostPortrait } from './GhostPortrait'

type Props = {
  messages: TerminalMessage[]
  thinking: boolean
}

export function MessageList({ messages, thinking }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  return (
    <div className="message-log" role="log" aria-live="polite">
      {messages.map((msg) => {
        const ghost = msg.ghostId ? getCharacter(msg.ghostId) : null
        const who =
          msg.role === 'user'
            ? 'You'
            : msg.role === 'assistant' && ghost
              ? ghost.displayName
              : 'Terminal'

        return (
          <article
            key={msg.id}
            className={`msg msg-enter ${msg.role}`}
            style={
              ghost
                ? { ['--ghost-accent' as string]: ghost.accent }
                : undefined
            }
          >
            <div className="msg__head">
              {ghost && msg.role === 'assistant' ? (
                <GhostPortrait
                  id={ghost.id}
                  accent={ghost.accent}
                  size={36}
                  animate={false}
                />
              ) : (
                <span className="msg__avatar" aria-hidden>
                  {msg.role === 'user' ? '>' : '·'}
                </span>
              )}
              <div className="who">
                {who}
                {msg.generated ? ' · generated fiction' : ''}
              </div>
            </div>
            <div className="body">{msg.content}</div>
          </article>
        )
      })}
      {thinking ? (
        <div className="thinking" aria-busy="true">
          <span className="thinking__orb" aria-hidden />
          THE SPIRIT IS THINKING…
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  )
}

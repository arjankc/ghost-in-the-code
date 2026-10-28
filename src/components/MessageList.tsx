import { useEffect, useRef } from 'react'
import { getCharacter } from '../characters'
import type { TerminalMessage } from '../types'

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
        const who =
          msg.role === 'user'
            ? 'You'
            : msg.role === 'assistant' && msg.ghostId
              ? getCharacter(msg.ghostId).displayName
              : 'Terminal'

        return (
          <article
            key={msg.id}
            className={`msg ${msg.role}`}
            style={
              msg.ghostId
                ? {
                    ['--ghost-accent' as string]: getCharacter(msg.ghostId).accent,
                  }
                : undefined
            }
          >
            <div className="who">
              {who}
              {msg.generated ? ' · generated fiction' : ''}
            </div>
            <div className="body">{msg.content}</div>
          </article>
        )
      })}
      {thinking ? (
        <div className="thinking" aria-busy="true">
          THE SPIRIT IS THINKING…
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  )
}

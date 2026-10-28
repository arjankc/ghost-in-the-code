import { useRef, useState, type KeyboardEvent } from 'react'
import { sfx } from '../services/audio'

type Props = {
  disabled?: boolean
  placeholder?: string
  onSend: (value: string) => void
}

export function InputLine({
  disabled,
  placeholder = 'Speak to the ghost… (Enter to send, Shift+Enter for newline)',
  onSend,
}: Props) {
  const [value, setValue] = useState('')
  const lastTypeAt = useRef(0)

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    sfx.send()
    onSend(trimmed)
    setValue('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="input-row">
      <div className="input-wrap">
        <span className="input-prompt" aria-hidden>
          ▸
        </span>
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            const now = Date.now()
            if (now - lastTypeAt.current > 55) {
              sfx.type()
              lastTypeAt.current = now
            }
          }}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message input"
          rows={3}
        />
      </div>
      <button
        type="button"
        className="btn primary"
        disabled={disabled || !value.trim()}
        onClick={submit}
      >
        SEND
      </button>
    </div>
  )
}

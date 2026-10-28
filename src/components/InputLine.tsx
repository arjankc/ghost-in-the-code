import { useState, type KeyboardEvent } from 'react'

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

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
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
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        aria-label="Message input"
        rows={3}
      />
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

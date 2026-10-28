import type { RuntimeStatus } from '../types'

type Props = {
  status: RuntimeStatus | null
  loading: boolean
  onRetry: () => void
  onTest: () => void
  testResult?: string | null
  onContinueAnyway?: () => void
}

export function SetupScreen({
  status,
  loading,
  onRetry,
  onTest,
  testResult,
  onContinueAnyway,
}: Props) {
  const model = status?.modelName ?? 'qwen2.5:1.5b'

  return (
    <section className="setup-screen" aria-live="polite">
      <h2>Summoning the Local Spirit</h2>
      <p className="disclaimer">
        This game uses a local open-weight model through Ollama. No cloud AI
        fallback is used. After setup, core play works offline.
      </p>

      <ol>
        <li>
          Install Ollama from{' '}
          <a href="https://ollama.com/download" target="_blank" rel="noreferrer">
            ollama.com/download
          </a>
        </li>
        <li>
          Download the model (~986 MB): <code>ollama pull {model}</code>
        </li>
        <li>Ensure the Ollama app/service is running on this machine.</li>
        <li>
          Keep this app on localhost, then press <strong>Retry</strong>.
        </li>
      </ol>

      <ul className="layer-list">
        <li>
          <span>App loaded locally</span>
          <span className="badge ok">yes</span>
        </li>
        <li>
          <span>Ollama runtime</span>
          <span
            className={`badge ${status?.runtimeAvailable ? 'ok' : 'err'}`}
          >
            {status?.runtimeAvailable ? 'available' : 'missing'}
          </span>
        </li>
        <li>
          <span>Model installed</span>
          <span className={`badge ${status?.modelInstalled ? 'ok' : 'warn'}`}>
            {status?.modelInstalled ? model : `need ${model}`}
          </span>
        </li>
        <li>
          <span>Browser network</span>
          <span className="badge warn">
            {typeof navigator !== 'undefined' && navigator.onLine
              ? 'online (not proof of AI readiness)'
              : 'offline (local AI can still work)'}
          </span>
        </li>
      </ul>

      {status?.error ? (
        <p className="disclaimer" style={{ color: 'var(--danger)', marginTop: '0.75rem' }}>
          {status.error}
        </p>
      ) : null}

      {testResult ? (
        <p className="disclaimer" style={{ marginTop: '0.75rem', color: 'var(--phosphor)' }}>
          {testResult}
        </p>
      ) : null}

      <div className="setup-actions">
        <button type="button" className="btn primary" onClick={onRetry} disabled={loading}>
          {loading ? 'CHECKING…' : 'RETRY'}
        </button>
        <button
          type="button"
          className="btn amber"
          onClick={onTest}
          disabled={loading || !status?.runtimeAvailable || !status?.modelInstalled}
        >
          TEST PROMPT
        </button>
        {onContinueAnyway ? (
          <button type="button" className="btn" onClick={onContinueAnyway}>
            ENTER TERMINAL ANYWAY
          </button>
        ) : null}
      </div>
    </section>
  )
}

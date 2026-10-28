import { useCallback, useEffect, useMemo, useState } from 'react'
import { Ghost, Volume2, VolumeX, WifiOff, Wind } from 'lucide-react'
import { BootSequence } from './components/BootSequence'
import { FxLayer } from './components/FxLayer'
import { GhostPortrait } from './components/GhostPortrait'
import { GhostSelector } from './components/GhostSelector'
import { InputLine } from './components/InputLine'
import { MessageList } from './components/MessageList'
import { MysteryPanel } from './components/MysteryPanel'
import { ScoreBurst } from './components/ScoreBurst'
import { SetupScreen } from './components/SetupScreen'
import { getCharacter } from './characters'
import { ApiError, fetchStatus, runTestPrompt, sendChat } from './services/api'
import {
  setAmbientEnabled,
  setMuted,
  sfx,
  unlockAudio,
} from './services/audio'
import { loadSettings, saveSettings, type AppSettings } from './services/settings'
import {
  clearConversation,
  loadProgress,
  recordPuzzleScore,
  resetProgress,
  saveConversation,
  setSelectedGhost,
} from './services/storage'
import './styles/terminal.css'
import type {
  GhostId,
  ProgressState,
  Puzzle,
  RuntimeStatus,
  TerminalMessage,
} from './types'
import { config, createId } from './utils/clientConfig'

function note(content: string): TerminalMessage {
  return {
    id: createId(),
    role: 'system-note',
    content,
    timestamp: Date.now(),
  }
}

function greetingFor(ghostId: GhostId): TerminalMessage[] {
  const ghost = getCharacter(ghostId)
  return [
    note(
      `${config.appName} v${config.version} — local inference only. Characters are fictional.`,
    ),
    {
      id: createId(),
      role: 'assistant',
      ghostId,
      content: ghost.greeting,
      generated: false,
      timestamp: Date.now(),
    },
  ]
}

export default function App() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [booted, setBooted] = useState(false)
  const [status, setStatus] = useState<RuntimeStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [entered, setEntered] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [errorFlash, setErrorFlash] = useState<string | null>(null)
  const [scoreBurst, setScoreBurst] = useState<{
    score: number
    title: string
  } | null>(null)

  const ghostId = progress.selectedGhost
  const ghost = useMemo(() => getCharacter(ghostId), [ghostId])

  const [messages, setMessages] = useState<TerminalMessage[]>(() => {
    const stored =
      loadProgress().conversationByGhost[loadProgress().selectedGhost]
    if (stored && stored.length > 0) return stored
    return greetingFor(loadProgress().selectedGhost)
  })

  useEffect(() => {
    setMuted(settings.soundMuted)
    setAmbientEnabled(settings.ambientOn)
  }, [settings.soundMuted, settings.ambientOn])

  useEffect(() => {
    function unlock() {
      void unlockAudio()
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true)
    setErrorFlash(null)
    try {
      const next = await fetchStatus()
      setStatus(next)
      if (next.runtimeAvailable && next.modelInstalled) {
        setEntered(true)
      }
    } catch (err) {
      setStatus({
        runtimeAvailable: false,
        modelInstalled: false,
        modelName: 'qwen2.5:1.5b',
        models: [],
        error: err instanceof Error ? err.message : 'Could not reach local API',
      })
    } finally {
      setStatusLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  useEffect(() => {
    saveConversation(ghostId, messages)
  }, [ghostId, messages])

  useEffect(() => {
    if (!thinking) return
    sfx.think()
    const id = window.setInterval(() => sfx.think(), 1600)
    return () => window.clearInterval(id)
  }, [thinking])

  function patchSettings(partial: Partial<AppSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      saveSettings(next)
      return next
    })
  }

  function selectGhost(id: GhostId) {
    if (id === ghostId) return
    sfx.summon()
    setGlitch(true)
    window.setTimeout(() => setGlitch(false), 450)
    const next = setSelectedGhost(id)
    setProgress(next)
    const stored = next.conversationByGhost[id]
    setMessages(stored && stored.length > 0 ? stored : greetingFor(id))
  }

  async function handleSend(text: string) {
    if (thinking) return
    await unlockAudio()
    setThinking(true)
    setErrorFlash(null)

    const userMsg: TerminalMessage = {
      id: createId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages([...messages, userMsg])

    try {
      const reply = await sendChat({
        ghostId,
        history: messages,
        userMessage: text,
      })
      sfx.reply()
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          ghostId,
          content: reply.content,
          generated: true,
          timestamp: Date.now(),
        },
        note(reply.disclaimer),
      ])
    } catch (err) {
      sfx.error()
      setGlitch(true)
      window.setTimeout(() => setGlitch(false), 500)
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Request failed'
      setErrorFlash(message)
      setMessages((prev) => [...prev, note(`Signal lost: ${message}`)])
    } finally {
      setThinking(false)
    }
  }

  async function handleHint(puzzle: Puzzle, hintsUsed: number) {
    if (thinking) return
    setThinking(true)
    const prompt = `I am on puzzle "${puzzle.title}". I have used ${hintsUsed} curated hint(s). Give a short in-character nudge that does not spoil the exact accepted answer.`
    const context = `${puzzle.story}\n\nCode:\n${puzzle.code}\n\nTask:\n${puzzle.task}`
    try {
      const reply = await sendChat({
        ghostId,
        history: messages,
        userMessage: prompt,
        mode: 'hint',
        puzzleContext: context,
      })
      sfx.reply()
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'user',
          content: `[Hint request for ${puzzle.title}]`,
          timestamp: Date.now(),
        },
        {
          id: createId(),
          role: 'assistant',
          ghostId,
          content: reply.content,
          generated: true,
          timestamp: Date.now(),
        },
      ])
    } catch (err) {
      sfx.error()
      const message = err instanceof Error ? err.message : 'Hint request failed'
      setMessages((prev) => [
        ...prev,
        note(`Hint spirit unavailable: ${message}`),
      ])
    } finally {
      setThinking(false)
    }
  }

  function handleSolved(puzzleId: string, score: number, title: string) {
    const next = recordPuzzleScore(puzzleId, score)
    setProgress(next)
    setScoreBurst({ score, title })
    setMessages((prev) => [
      ...prev,
      note(`Case closed: ${puzzleId} — score ${score}. Best saved locally.`),
    ])
  }

  async function handleTest() {
    setTestResult('Running test prompt…')
    const result = await runTestPrompt()
    if (result.ok) sfx.reply()
    else sfx.error()
    setTestResult(
      result.ok
        ? `Test OK: ${result.reply}`
        : `Test failed: ${result.error ?? 'unknown error'}`,
    )
    await refreshStatus()
  }

  function handleClearConversation() {
    sfx.click()
    const next = clearConversation(ghostId)
    setProgress(next)
    setMessages(greetingFor(ghostId))
  }

  function handleResetProgress() {
    const confirmed = window.confirm(
      'Reset all local progress, best scores, and saved conversations?',
    )
    if (!confirmed) return
    sfx.wrong()
    const next = resetProgress()
    setProgress(next)
    setMessages(greetingFor(next.selectedGhost))
  }

  const ready = Boolean(status?.runtimeAvailable && status?.modelInstalled)
  const showSetup = booted && (!entered || !ready)

  if (!booted) {
    return (
      <div className="app-shell">
        <div className="crt-frame">
          <BootSequence
            reducedMotion={settings.reducedMotion}
            onDone={() => setBooted(true)}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`app-shell ${settings.reducedMotion ? 'reduce-motion' : ''}`}
      style={{ ['--ghost-accent' as string]: ghost.accent }}
    >
      <div className="crt-frame">
        <FxLayer
          accent={ghost.accent}
          thinking={thinking}
          glitch={glitch}
          reducedMotion={settings.reducedMotion}
        />

        <header className="header-bar">
          <div className="brand">
            <h1>{config.appName}</h1>
            <p className="tagline">{config.tagline}</p>
          </div>
          <div className="header-ghost" aria-hidden>
            <GhostPortrait
              id={ghost.id}
              accent={ghost.accent}
              size={48}
              animate
            />
          </div>
          <span className={`badge ${ready ? 'ok' : 'err'}`}>
            <span className="pulse" aria-hidden />
            {ready ? (
              <>
                <Ghost size={12} aria-hidden /> LOCAL AI READY
              </>
            ) : (
              <>
                <WifiOff size={12} aria-hidden /> LOCAL AI OFFLINE
              </>
            )}
          </span>
          <span className="badge">v{config.version}</span>
          <span className="badge warn">MODEL {status?.modelName ?? '…'}</span>
          <div className="audio-controls">
            <button
              type="button"
              className="btn icon-btn"
              title={settings.soundMuted ? 'Unmute' : 'Mute'}
              aria-pressed={settings.soundMuted}
              onClick={() => {
                sfx.toggle()
                patchSettings({ soundMuted: !settings.soundMuted })
              }}
            >
              {settings.soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button
              type="button"
              className="btn icon-btn"
              title={settings.ambientOn ? 'Ambient on' : 'Ambient off'}
              aria-pressed={settings.ambientOn}
              onClick={() => {
                sfx.toggle()
                patchSettings({ ambientOn: !settings.ambientOn })
              }}
            >
              <Wind size={14} />
            </button>
          </div>
        </header>

        {showSetup && !entered ? (
          <div className="setup-wrap">
            <SetupScreen
              status={status}
              loading={statusLoading}
              onRetry={() => void refreshStatus()}
              onTest={() => void handleTest()}
              testResult={testResult}
              onContinueAnyway={() => setEntered(true)}
            />
          </div>
        ) : (
          <div className="main-grid">
            <section className="terminal-pane">
              <div className="status-bar">
                <span className="badge ok">GHOST: {ghost.displayName}</span>
                <span className="badge">
                  CASES SOLVED: {progress.completedPuzzleIds.length}/5
                </span>
                {errorFlash ? (
                  <span className="badge err">{errorFlash}</span>
                ) : (
                  <span className="badge warn">NO CLOUD FALLBACK</span>
                )}
              </div>
              <MessageList messages={messages} thinking={thinking} />
              <InputLine
                disabled={thinking || !ready}
                onSend={(t) => void handleSend(t)}
              />
              {!ready ? (
                <div style={{ padding: '0 0.9rem 0.75rem' }}>
                  <SetupScreen
                    status={status}
                    loading={statusLoading}
                    onRetry={() => void refreshStatus()}
                    onTest={() => void handleTest()}
                    testResult={testResult}
                  />
                </div>
              ) : null}
            </section>

            <aside className="side-pane">
              <GhostSelector
                selected={ghostId}
                onSelect={selectGhost}
                disabled={thinking}
              />
              <MysteryPanel
                progress={progress}
                busy={thinking}
                onAskHint={(p, n) => void handleHint(p, n)}
                onSolved={handleSolved}
              />
              <div className="side-section">
                <h2>Local Data</h2>
                <p className="disclaimer">
                  Progress, settings, and chat stay in localStorage. Sounds are
                  synthesised in-browser (no audio downloads).
                </p>
                <div className="setup-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={handleClearConversation}
                    disabled={thinking}
                  >
                    CLEAR CHAT
                  </button>
                  <button
                    type="button"
                    className="btn danger"
                    onClick={handleResetProgress}
                  >
                    RESET PROGRESS
                  </button>
                </div>
                <div className="setup-actions">
                  {ghost.starters.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      className="btn"
                      disabled={thinking || !ready}
                      onClick={() => void handleSend(starter)}
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        <footer className="footer-bar">
          <span className="disclaimer">
            Open-weight local inference via Ollama · MIT app code · procedural
            audio
          </span>
          <button
            type="button"
            className="btn"
            onClick={() => void refreshStatus()}
          >
            REFRESH STATUS
          </button>
        </footer>

        <ScoreBurst
          score={scoreBurst?.score ?? null}
          title={scoreBurst?.title}
          onDismiss={() => setScoreBurst(null)}
        />
      </div>
    </div>
  )
}

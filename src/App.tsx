import { useCallback, useEffect, useMemo, useState } from 'react'
import { CircleHelp, Ghost, Volume2, VolumeX, WifiOff, Wind } from 'lucide-react'
import { achievements } from './achievements/catalog'
import { AchievementsPanel } from './components/AchievementsPanel'
import { BootSequence } from './components/BootSequence'
import { Chronicle } from './components/Chronicle'
import { FxLayer } from './components/FxLayer'
import { GameHud } from './components/GameHud'
import { GhostPortrait } from './components/GhostPortrait'
import { GhostSelector } from './components/GhostSelector'
import { HelpOverlay } from './components/HelpOverlay'
import { InputLine } from './components/InputLine'
import { LevelUpBurst } from './components/LevelUpBurst'
import { MessageList } from './components/MessageList'
import { MysteryPanel } from './components/MysteryPanel'
import { QuestBoard } from './components/QuestBoard'
import { RelicShelf } from './components/RelicShelf'
import { ScoreBurst } from './components/ScoreBurst'
import { SetupScreen } from './components/SetupScreen'
import { getCharacter } from './characters'
import { applyGameEvent } from './game/engine'
import { questById } from './game/quests'
import { relicById } from './game/relics'
import { puzzleIntro } from './puzzles/intros'
import { puzzles } from './puzzles/puzzles'
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
  commitProgress,
  loadProgress,
  resetProgress,
  saveConversation,
  setPreferredDifficulty,
} from './services/storage'
import './styles/terminal.css'
import type {
  GhostId,
  ProgressState,
  Puzzle,
  PuzzleDifficulty,
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
      `${config.appName} v${config.version} — local RPG mode. Earn XP, relics, and quests offline. Press ? for help.`,
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
  const [helpOpen, setHelpOpen] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [errorFlash, setErrorFlash] = useState<string | null>(null)
  const [achievementToasts, setAchievementToasts] = useState<string[]>([])
  const [xpFlash, setXpFlash] = useState(0)
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const [scoreBurst, setScoreBurst] = useState<{
    score: number
    title: string
  } | null>(null)

  const ghostId = progress.selectedGhost
  const ghost = useMemo(() => getCharacter(ghostId), [ghostId])
  const relic = relicById(progress.equippedRelic)

  const [messages, setMessages] = useState<TerminalMessage[]>(() => {
    const stored =
      loadProgress().conversationByGhost[loadProgress().selectedGhost]
    if (stored && stored.length > 0) return stored
    return greetingFor(loadProgress().selectedGhost)
  })

  const runEvent = useCallback((event: Parameters<typeof applyGameEvent>[1]) => {
    // Always read latest persisted state to avoid stale React closures.
    const delta = applyGameEvent(loadProgress(), event)
    commitProgress(delta.state)
    setProgress(delta.state)
    if (delta.xpGained > 0) {
      setXpFlash(delta.xpGained)
      sfx.xp()
      window.setTimeout(() => setXpFlash(0), 1200)
    }
    if (delta.leveledUpTo) {
      sfx.levelUp()
      setLevelUp(delta.leveledUpTo)
    }
    if (delta.newQuests.length) sfx.quest()
    if (delta.newAchievements.length) {
      setAchievementToasts(delta.newAchievements)
    }
    return delta
  }, [])

  useEffect(() => {
    setMuted(settings.soundMuted)
    setAmbientEnabled(settings.ambientOn)
  }, [settings.soundMuted, settings.ambientOn])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--phosphor', relic.theme.phosphor)
    root.style.setProperty('--amber', relic.theme.amber)
    root.style.setProperty('--violet', relic.theme.violet)
    root.style.setProperty('--glow', relic.theme.glow)
  }, [relic])

  useEffect(() => {
    function unlock() {
      void unlockAudio()
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '?' && e.key !== '/') return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return
      e.preventDefault()
      setHelpOpen((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true)
    setErrorFlash(null)
    try {
      const next = await fetchStatus()
      setStatus(next)
      if (next.runtimeAvailable && next.modelInstalled) setEntered(true)
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
    const delta = runEvent({ type: 'ghost_summoned', ghostId: id })
    const stored = delta.state.conversationByGhost[id]
    setMessages(stored && stored.length > 0 ? stored : greetingFor(id))
  }

  function handleBeginCase(puzzle: Puzzle) {
    const intro = puzzleIntro(puzzle, ghostId)
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: 'assistant',
        ghostId: intro.ghostId,
        content: intro.text,
        generated: false,
        timestamp: Date.now(),
      },
      note(
        `Case opened: ${puzzle.title} (${puzzle.difficulty}). Combo at risk if you fail.`,
      ),
    ])
  }

  async function handleSend(text: string) {
    if (thinking) return
    await unlockAudio()
    setThinking(true)
    setErrorFlash(null)
    runEvent({ type: 'message', ghostId })

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
    runEvent({ type: 'hint_used' })
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

  function handleSolved(puzzle: Puzzle, score: number, _hints: number) {
    const delta = runEvent({
      type: 'puzzle_solved',
      puzzleId: puzzle.id,
      score,
      difficulty: puzzle.difficulty,
      preferredGhost: puzzle.preferredGhost,
    })
    setScoreBurst({ score, title: puzzle.title })
    const lines = [
      note(
        `Case closed: ${puzzle.title} — ${score} pts · combo ×${delta.state.combo} · +${delta.xpGained} XP`,
      ),
    ]
    for (const id of delta.newAchievements) {
      const a = achievements.find((x) => x.id === id)
      if (a) lines.push(note(`Achievement: ${a.title}`))
    }
    for (const id of delta.newQuests) {
      const q = questById(id)
      if (q) lines.push(note(`Quest complete: ${q.title}`))
    }
    for (const id of delta.newRelics) {
      lines.push(note(`Relic unlocked: ${relicById(id).name}`))
    }
    setMessages((prev) => [...prev, ...lines])
  }

  function handleFail() {
    runEvent({ type: 'puzzle_fail' })
    setGlitch(true)
    window.setTimeout(() => setGlitch(false), 350)
  }

  function handleDifficulty(d: PuzzleDifficulty | 'any') {
    setProgress(setPreferredDifficulty(d))
  }

  function handleEquip(relicId: string) {
    runEvent({ type: 'equip_relic', relicId })
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
      'Reset ALL game progress — XP, quests, relics, scores, and chats?',
    )
    if (!confirmed) return
    sfx.wrong()
    const next = resetProgress()
    setProgress(next)
    setAchievementToasts([])
    setLevelUp(null)
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
            onDone={() => {
              setBooted(true)
              const delta = applyGameEvent(loadProgress(), {
                type: 'session_start',
              })
              commitProgress(delta.state)
              setProgress(delta.state)
              if (delta.xpGained) setXpFlash(delta.xpGained)
            }}
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
          <span className="badge warn">{relic.name}</span>
          <div className="audio-controls">
            <button
              type="button"
              className="btn icon-btn"
              title="Help (?)"
              onClick={() => setHelpOpen(true)}
            >
              <CircleHelp size={14} />
            </button>
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
              <GameHud progress={progress} xpFlash={xpFlash} />
              <div className="status-bar">
                <span className="badge ok">GHOST: {ghost.displayName}</span>
                <span className="badge">
                  CASES: {progress.completedPuzzleIds.length}/{puzzles.length}
                </span>
                <span className="badge warn">
                  QUESTS {progress.completedQuests.length}/8
                </span>
                {errorFlash ? (
                  <span className="badge err">{errorFlash}</span>
                ) : (
                  <span className="badge">NO CLOUD FALLBACK</span>
                )}
              </div>
              <MessageList
                messages={messages}
                thinking={thinking}
                typewriter={!settings.reducedMotion}
              />
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
                progress={progress}
                onSelect={selectGhost}
                disabled={thinking}
              />
              <MysteryPanel
                progress={progress}
                busy={thinking}
                onDifficultyChange={handleDifficulty}
                onBeginCase={handleBeginCase}
                onAskHint={(p, n) => void handleHint(p, n)}
                onFail={handleFail}
                onSolved={handleSolved}
              />
              <QuestBoard progress={progress} />
              <RelicShelf progress={progress} onEquip={handleEquip} />
              <AchievementsPanel
                progress={progress}
                toastIds={achievementToasts}
              />
              <Chronicle progress={progress} />
              <div className="side-section">
                <h2>Local Data</h2>
                <p className="disclaimer">
                  Full RPG progress stays in localStorage. No accounts, no
                  cloud saves.
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
            Local-first AI RPG · Ollama inference · procedural audio · ? help
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
          onDismiss={() => {
            setScoreBurst(null)
            setAchievementToasts([])
          }}
        />
        <LevelUpBurst level={levelUp} onDismiss={() => setLevelUp(null)} />
        <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </div>
  )
}

import type { ProgressState } from '../types'

type Props = {
  progress: ProgressState
}

export function Chronicle({ progress }: Props) {
  return (
    <div className="side-section">
      <h2>Chronicle</h2>
      {progress.chronicle.length === 0 ? (
        <p className="disclaimer">Your deeds will etch here.</p>
      ) : (
        <ul className="chronicle-list">
          {progress.chronicle.slice(0, 12).map((e) => (
            <li key={e.id}>
              <time dateTime={new Date(e.at).toISOString()}>
                {new Date(e.at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
              <span>{e.text}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="stat-grid">
        <div>
          <strong>{progress.stats.messagesSent}</strong>
          <span>msgs</span>
        </div>
        <div>
          <strong>{progress.stats.casesSolved}</strong>
          <span>solves</span>
        </div>
        <div>
          <strong>{progress.stats.perfectSolves}</strong>
          <span>perfect</span>
        </div>
        <div>
          <strong>{progress.stats.hintsUsed}</strong>
          <span>hints</span>
        </div>
      </div>
    </div>
  )
}

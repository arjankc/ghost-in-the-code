# Architecture

Ghost in the Code is a local-first educational game with three layers:

1. **React UI** (`src/`) — haunted terminal, ghost selection, mystery panel, localStorage progress.
2. **Local API** (`server/`) — Express on `127.0.0.1`, validates chat requests, never accepts remote Ollama URLs from clients.
3. **Ollama adapter** (`server/ollamaAdapter.ts`) — sole bridge to the open-weight model runtime.

```
Browser (Vite)  --proxy /api-->  Express (8787)  -->  Ollama (11434)
       |                              |
  localStorage                   localhost only
  puzzles JSON                   model from .env
```

## Safety boundaries

- Puzzle answers are validated in the client with deterministic string rules (`src/puzzles/validate.ts`).
- Scores are computed in `src/puzzles/scoring.ts` — the model never awards points.
- Model output is rendered as plain text, never as HTML.
- No `eval`, shell, or code execution of player/model output.

## Extending

- **New ghost:** add a file under `src/characters/` and register it in `src/characters/index.ts`.
- **New puzzle:** append an object to `src/puzzles/puzzles.ts`.
- **New runtime:** replace or wrap `server/ollamaAdapter.ts` while keeping `/api/chat` and `/api/status` shapes.

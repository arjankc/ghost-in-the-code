# Ghost in the Code

**Every language leaves a ghost behind.**

A local-first AI educational game for the Hacktoberfest Open-Source AI Challenge (Week 4: *Ghost in the Machine*). Summon fictional spirits inspired by historical programming languages in a haunted terminal, learn concepts, and **Exorcise the Bug** — with inference running on your machine through [Ollama](https://ollama.com).

## Features

- Phosphor-green haunted terminal UI (CRT-inspired, local assets only)
- Boot sequence, floating ghost portraits, particle FX, and score bursts
- Procedural Web Audio SFX + ambient hum (no audio files / CDNs)
- Three characters: **COBOL**, **BASIC**, and **Assembly**
- Local open-weight chat (no cloud AI fallback)
- Six curated debugging mysteries with deterministic scoring
- Full local RPG layer: XP, levels, titles, combos, daily streaks
- Ghost affinity meters, quest board, unlockable relic themes
- Chronicle + stats, level-gated advanced cases, achievements
- Typewriter replies, boot sequence, procedural audio, `?` help
- All progress in `localStorage` (no accounts / cloud saves)
- Clear setup / missing-runtime screens
- Documented offline verification path

## Screenshots

Capture after launch:

1. Setup / status screen with local AI readiness
2. Conversation with COBOL in the terminal
3. An open mystery in **Exorcise the Bug**

Save images under `docs/screenshots/` if you publish the repo.

## Tech stack

- React 19 + Vite + TypeScript
- Express (localhost API)
- Ollama (local model runtime)
- Vitest (game logic tests)

## Architecture

See [docs/architecture.md](docs/architecture.md). Short version: the browser talks only to a localhost Express service; that service talks only to a configured localhost Ollama endpoint.

## Prerequisites

- Node.js 20+ (tested on 22)
- npm
- [Ollama](https://ollama.com/download)
- ~1 GB free disk for the default model (more if you choose larger tags)

## Installation

```powershell
git clone <your-repo-url> "Ghost in the code"
cd "Ghost in the code"
copy .env.example .env
npm install
```

## Model download (user-initiated)

Default model: **`qwen2.5:1.5b`** (~986 MB, Apache-2.0). Chosen for limited VRAM (e.g. GTX 1050 Ti) and a permissive weights license.

```powershell
ollama pull qwen2.5:1.5b
```

Details and alternatives: [docs/model-setup.md](docs/model-setup.md).

> The application code is MIT. Model weights are under **separate** licenses. Do not assume they match.

## Start the app

```powershell
npm run dev
```

- UI: http://127.0.0.1:5173  
- API: http://127.0.0.1:8787  

Production-style:

```powershell
npm run build
npm start
```

Then open http://127.0.0.1:8787

## Offline verification

Follow [docs/offline-verification.md](docs/offline-verification.md). After the model is installed, disconnect the network and confirm chat + puzzles still work against local Ollama.

## Scoring rules (Exorcise the Bug)

| Hints used | Score if correct |
| --- | --- |
| 0 | 100 |
| 1 | 75 |
| 2 | 50 |
| 3+ | 25 |

Incorrect attempts do not end the case. The model may hint; it does **not** decide correctness or score.

## Why open innovation matters

- **Local inference** avoids per-request cloud AI fees for core play
- **Prompts stay on your machine** — no mandatory remote AI vendor
- **Offline classrooms / flaky networks** can still run the experience after setup
- **Swap models** via `.env` without rewriting the game
- **Inspect and modify** characters, puzzles, and prompts freely
- **No lock-in** to a commercial chat API’s continued availability

Hardware, electricity, disk, and setup time still have costs — local is not “free,” just differently owned.

## Security & privacy

- Server binds to `127.0.0.1` by default
- Clients cannot supply an arbitrary remote Ollama URL
- No accounts, analytics, or telemetry
- No execution of model-generated or player-submitted code
- AI replies are plain text only

## Model licensing

| Component | License |
| --- | --- |
| This repository (app code) | MIT — see [LICENSE](LICENSE) |
| Default weights `qwen2.5:1.5b` | Apache-2.0 (per Ollama/Qwen2.5 docs for non-3B/72B sizes) |
| Optional `qwen2.5:3b` | Qwen Research License (non-commercial terms) — document before using |

Always verify the license blob for the exact tag you pull.

## Limitations

- Ollama must be installed separately; the app does not auto-download multi‑GB weights
- Small models may break character or invent soft details — UI marks generated fiction
- Not a substitute for primary computing-history sources
- Desktop wrappers (Tauri/Electron) are out of MVP scope

## Demo script (~3 minutes)

1. **0:00** Open the CRT terminal; introduce language-ghosts  
2. **0:20** Select COBOL; ask about modern rewrites; show local reply  
3. **0:55** Start a mystery; take a hint; submit; show score  
4. **1:40** Show `.env` / status — model runs on-device  
5. **2:20** Offline check (if pre-verified) — fresh prompt still works  
6. **2:45** Repo: README + how to add a ghost under `src/characters/`

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | API + Vite together |
| `npm test` | Vitest unit tests |
| `npm run build` | Typecheck + production bundle |
| `npm start` | Serve API + built UI |

## Contributing

1. Keep P0 local-first / offline principles  
2. Add ghosts as data files; keep prompts honest about fiction  
3. Prefer deterministic validators for puzzles  
4. Run `npm test` and `npm run build` before opening a PR  

## Troubleshooting

See [docs/troubleshooting.md](docs/troubleshooting.md).

## Future improvements

- Difficulty filter UI wired to `preferredDifficulty`
- Streaming token display
- Optional Gemma profile for prize-track demos
- Packaged desktop shell

## License

MIT for application source. Model weights: see [docs/model-setup.md](docs/model-setup.md).

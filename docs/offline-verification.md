# Offline verification procedure

This verifies that **local inference** works without internet after setup. Browser `navigator.onLine` alone is not proof.

## Preconditions

- Ollama installed and running
- Configured model already pulled (`ollama list` shows it)
- App dependencies installed (`npm install`)
- `npm run dev` (or built `npm run build` + `npm start`) succeeds

## Steps

1. Start Ollama and the application while online.
2. Open the UI and confirm status shows **LOCAL AI READY**.
3. Optionally run **TEST PROMPT** on the setup screen.
4. Disconnect the network (disable Wi‑Fi / unplug Ethernet / airplane mode).
5. Refresh or continue the haunted terminal.
6. Send a new question to a ghost (e.g. COBOL).
7. Confirm a response appears (may be slower on CPU).
8. Complete a curated puzzle with a known correct answer.
9. Refresh the page and confirm best scores remain.

## Pass criteria

- Chat replies while disconnected
- Puzzle scoring still works
- Progress persists in localStorage
- No cloud AI provider was contacted

## If it fails

- Confirm Ollama still answers: `curl http://127.0.0.1:11434/api/tags`
- Confirm the app API: `curl http://127.0.0.1:8787/api/status`
- See [troubleshooting.md](troubleshooting.md)

# Troubleshooting

## Ollama is not recognized

Install from https://ollama.com/download, then open a **new** terminal. On Windows, sign out/in if `PATH` did not update.

## `RUNTIME_UNAVAILABLE`

Ollama is not listening on `127.0.0.1:11434`. Start the Ollama application/service and retry.

## `MODEL_MISSING`

Pull the configured model:

```powershell
ollama pull qwen2.5:1.5b
```

Ensure `.env` `OLLAMA_MODEL` matches a name from `ollama list`.

## Slow or timed-out replies

Expected on a GTX 1050 Ti / CPU offload. Increase `OLLAMA_TIMEOUT_MS`, lower `OLLAMA_NUM_PREDICT`, or use a smaller model.

## API proxy errors during `npm run dev`

Both processes must run. Use `npm run dev` (server + Vite). Vite proxies `/api` to `http://127.0.0.1:8787`.

## Progress won’t clear

Use **RESET PROGRESS** in the side panel, or clear site data for `http://127.0.0.1:5173` in the browser.

# Model setup

## Default model

| Setting | Value |
| --- | --- |
| Identifier | `qwen2.5:1.5b` |
| Approx. download | ~986 MB |
| Source | [Ollama library — qwen2.5](https://ollama.com/library/qwen2.5) |
| Weights license | Apache License 2.0 (Qwen2.5 1.5B) |
| Why this default | Fits limited VRAM (e.g. GTX 1050 Ti 4 GB) and uses a permissive model license |

Configure via `.env`:

```env
OLLAMA_MODEL=qwen2.5:1.5b
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_TEMPERATURE=0.7
OLLAMA_NUM_PREDICT=256
```

## Install steps (Windows)

1. Install Ollama from https://ollama.com/download
2. Open a new terminal so `ollama` is on `PATH`
3. Pull the model (user-initiated — the app will not auto-download):

```powershell
ollama pull qwen2.5:1.5b
```

4. Confirm:

```powershell
ollama list
curl http://127.0.0.1:11434/api/tags
```

## Optional larger model

`qwen2.5:3b` (~1.9 GB) may produce richer dialogue but:

- Needs more RAM/VRAM or slower CPU offload
- Uses the **Qwen Research License** (non-commercial research/evaluation terms) — separate from this app’s MIT license

```env
OLLAMA_MODEL=qwen2.5:3b
```

## Gemma note

For Hacktoberfest “Best Use of Gemma” experiments you can point `OLLAMA_MODEL` at a Gemma tag available in your Ollama install (verify size and license first). The app code does not embed Gemma weights.

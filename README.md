# Hinge

An interactive **counterfactual history engine**. Pick a real historical event
and a divergence — *"What if Hannibal had marched on Rome after Cannae?"* — and
Hinge reasons out a plausible alternate timeline as a branching tree of
consequences, generated in stages so each branch builds on the ones before it.

Built as a research tool, not a chatbot: dense, scannable, a little academic.

## Stack

- **Client** — Vite + React + TypeScript + Tailwind. A single-page app: a
  horizontally-scrolling timeline of branching event nodes.
- **Server** — a thin Express proxy (TypeScript via `tsx`) that keeps LLM keys
  off the client and runs the staged reasoning.
- **LLM** — abstracted behind one `generate(prompt)` module with two
  interchangeable backends: the **Anthropic API** and a local **Ollama**
  endpoint (run offline against a Qwen model).

## Layout

```
client/   Vite + React front end
server/   Express proxy + staged generation + LLM abstraction
```

## Running it

```bash
npm run install:all      # install root, server, and client deps
cp .env.example .env      # then fill in your keys / provider
npm run dev               # server on :8787, client on :5173 (proxies /api)
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to Express, so
the browser never sees your API key.

### Choosing a backend

Set `LLM_PROVIDER` in `.env`:

- `anthropic` — set `ANTHROPIC_API_KEY` (model defaults to `claude-opus-4-8`).
- `ollama` — point `OLLAMA_BASE_URL` at a running Ollama (`http://localhost:11434`)
  and `OLLAMA_MODEL` at a pulled model (e.g. `qwen2.5`). Fully offline.

## Run it with no setup (single file)

There's a standalone build that inlines the entire app into **one HTML file**
that runs fully in the browser — no server, no install. Good for opening on a
phone or anywhere you can't run Node.

```bash
npm --prefix client install
npm --prefix client run build:standalone   # -> client/dist-standalone/standalone.html
```

Open that file in any browser. It loads the sample timeline immediately and is
fully interactive (scroll the branching tree, click nodes). For **live**
generation, open ⚙ Settings and paste your own Anthropic API key — the
standalone build calls the Anthropic API directly from the browser
(`anthropic-dangerous-direct-browser-access`). The key is stored only in that
browser's local storage and is sent only to Anthropic. Leave it blank to just
browse the sample.

> The standalone build reuses the exact same staged-generation core as the
> server (`server/src/timeline`) — the LLM call is dependency-injected, so the
> same pipeline runs server-side or in-browser.

## How generation works

Consequences are reasoned in **stages**, not requested all at once:

1. **Immediate (0–5 yr)** effects of the divergence.
2. Those are fed back in to derive **medium-term** branches.
3. Which are fed back again for **long-term** branches.

How many stages run depends on the "simulate forward" slider (10 / 50 / 200 yr).
Every model response is forced into structured JSON
(`year, headline, consequence, confidence, parent_id`) and validated/repaired
before it reaches the UI. Clicking a node lets you **pull the thread** — reason
deeper from that point, or ask a follow-up that re-roots the simulation there.

## API

| Method | Route                       | Purpose                               |
| ------ | --------------------------- | ------------------------------------- |
| GET    | `/api/health`               | Liveness + active provider            |
| GET    | `/api/timeline/sample`      | Hardcoded reference divergence        |
| POST   | `/api/timeline/generate`    | Generate a timeline from a divergence |
| POST   | `/api/timeline/pull-thread` | Deepen / re-root from a node          |

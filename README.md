# Kenshō — ver la propia naturaleza

> *Kenshō* (見性) is a Zen term for a glimpse of one's true nature.  
> This project asks: what happens when two minds argue long enough that something neither intended begins to emerge?

---

## The idea

Most LLM experiments treat models as oracles — you ask, they answer. Kenshō treats them as agents with a history.

Two agents, A and B, debate philosophical concepts across multiple generations. Agent-A proposes. Agent-B attacks, defends, or forces the concept to evolve. Neither starts with knowledge — they start with empty world models and accumulate one: confirmed insights, rejected paths, recurring tension patterns, and a theory about how the other thinks.

The hypothesis is that adversarial pressure over time produces something different from either agent alone. Not consensus, but genuine conceptual evolution — ideas that neither agent would have produced in isolation, shaped by the friction between them.

A third agent, the Perturber (P), intervenes between generations. Its job is not to contribute to the debate but to prevent it from collapsing into comfortable agreement. It reads both world models and injects questions designed to maximize semantic distance from everything both agents already know — forcing them into unexplored territory before the next generation begins.

---

## What actually happens

Each **generation** runs a fixed number of **rounds**:

1. Agent-A generates a philosophical concept with a definition and a tension insight
2. Agent-B evaluates it — the outcome is one of three:
   - `accepted` — the concept survives as proposed
   - `rejected` — it is dismantled
   - `evolved` — B forces a refinement; A's concept mutates

At the end of each generation, both agents **distill** their accumulated interactions into an updated world model. This is not summarization — it is synthesis. The world model carries forward only what was productive: confirmed insights, patterns of tension, an evolving theory of what the other agent is doing.

Between generations (except after the last), Agent-P runs a **perturbation step**:
- It reads both world models
- Generates two orthogonal questions — one for A, one for B — designed to attack implicit assumptions neither has questioned
- Each agent's world model is partially disrupted: some confirmed insights are selectively forgotten, the perturbation question is injected as an open path, and tension patterns are crossed over between agents

This cycle repeats for each configured generation.

---

## Experiment Types

### Heuristic (default)

Measures **coherence** as information gain + emergence rate:

```
coherence = avgInformationGain × 0.6 + emergenceRate × 0.4
```

where `emergenceRate` is the fraction of rounds that produced an `evolved` outcome. A generation where everything gets accepted or rejected without mutation scores low. A generation with sustained productive tension scores high.

The working hypothesis is that without perturbation, coherence collapses after generation 2-3 as the agents converge on shared priors. The Perturber is the intervention against that collapse.

### Entropic (experimental)

Measures **epistemic entropy** via embedding-based metrics. Each concept is embedded and compared against previous concepts and the current world model to detect surprise and divergence. Per-generation metrics include:

- **Outcome Entropy** — Shannon entropy of the accepted/rejected/evolved distribution
- **Cosine Distance** — average semantic drift between consecutive concepts
- **WM Change Rate** — fraction of new insights added to the world model
- **Surprise Proxy** — 1 minus cosine similarity (novelty detector)

Entropic coherence combines outcome entropy and cosine distance to identify the peak chaos moment before insight collapse. Useful for falsifiability: run with/without the Perturber and compare entropy curves.

**Embedding backends:**
- `transformers.js (offline)` — MiniLM model runs in browser (~40MB, first load only)
- `OpenAI API` — uses text-embedding-3-small (recommended for production)

---

## Setup

```bash
git clone <repo>
cd kensho
npm install
```

Create a `.env` file at the root:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_OPENAI_API_KEY=sk-proj-...
VITE_GROK_API_KEY=xai-...
```

All keys are optional — you only need the ones for the providers you intend to use. Keys can also be entered directly in the UI.

```bash
npm run dev
# → http://localhost:5173
```

---

## Configuration

Each of the three agents (A, B, P) is configured independently:

| Agent | Role | Default model |
|-------|------|---------------|
| Agent-A | Generator — proposes concepts | claude-haiku-4-5 |
| Agent-B | Critic — accepts, rejects, or evolves | claude-haiku-4-5 |
| Agent-P | Perturber — disrupts between generations | claude-haiku-4-5 |

Supported providers: **Anthropic**, **OpenAI**, **Grok (xAI)**. Any agent can use any provider — you can run A on Claude, B on GPT-4o, and P on Grok simultaneously.

Sliders control the number of **generations** (2–8) and **rounds per generation** (2–10). A minimal run (2 generations × 2 rounds, all agents on Haiku) costs roughly $0.001.

Language (EN/ES) controls both the UI labels and the language in which agents think and respond.

---

## Interface

**En vivo / Live** — interactions appear in real time as they complete, newest first. Perturbation cards are interleaved between generation groups, showing what questions Agent-P injected and why.

**World Models** — the current internal state of both agents: what they believe, what they've ruled out, what tensions keep recurring, and what they think the other agent is doing.

**Coherencia / Coherence** — generation-by-generation coherence bars and a metrics table showing accepted, evolved, and rejected counts per generation.

**Reporte / Report** — a full experiment summary: agent configurations, coherence evolution, all emerged and accepted concepts, both final world models, all perturbations, and a cost breakdown table down to the individual API call.

**Entropía / Entropy** *(entropic mode only)* — outcome entropy and cosine distance bars per generation, plus a table of world model change rates.

**Embeddings** *(entropic mode only)* — timeline of surprise proxy, divergence from world model per round, and evolution of world model sizes across generations.

---

## Technical notes

- Runs entirely in the browser. No backend, no database.
- Anthropic calls are proxied through the Vite dev server to bypass the browser CORS restriction on `api.anthropic.com`. OpenAI and Grok support browser requests natively.
- All JSON responses are parsed with fence-stripping and regex fallback — agent outputs are treated as unreliable and handled defensively.
- World model distillation uses 1800 max tokens to avoid truncation mid-JSON.
- Entropic mode offers two embedding backends:
  - **transformers.js**: client-side, no API keys needed, ~40MB model downloaded on first use
  - **OpenAI API**: recommended for production (see Security note below)

---

## Security & Embedding Backends

### Recommended: OpenAI API Backend

For production use, prefer the **OpenAI API** embedding backend:
- ✅ No local model loading
- ✅ No transitive dependencies with known CVEs
- ✅ Minimal cost (~$0.0001 per 1M tokens)
- ✅ No client-side model download

### Alternative: transformers.js (Offline)

The `transformers.js` backend is **safe for development and testing**:
- Models are served by Hugging Face (trusted CDN)
- All transfers are HTTPS
- No server-side exposure
- Known transitive vulnerabilities in protobufjs (onnxruntime-web) have **low practical risk** due to trusted model sources

See [SECURITY.md](./SECURITY.md) for full vulnerability analysis.

---

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- No UI component libraries
- (Optional) `@xenova/transformers` for offline embeddings

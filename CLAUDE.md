# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Kenshō - Notas para Claude Code

Antes de cualquier cambio, leer:
- README.md → tono y motivación
- spec.md → especificación autoritativa
- specv2.md → especificación autoritativa

Reglas del proyecto:
- Tests pasando antes de cada commit.
- Documentar decisiones no triviales en docs/decisions/.
- Nunca commitear .env ni archivos *.db.

## Commands

```bash
npm run dev      # start dev server at http://localhost:5173
npm run build    # tsc type-check + vite production build
npm run preview  # serve the production build locally
npx tsc --noEmit # type-check only, no emit
```

There are no tests or linter configured. The canonical correctness check is `npm run build` (runs `tsc && vite build`).

## Architecture

Kenshō is a Vite + React + TypeScript single-page app that runs adversarial multi-agent philosophical experiments entirely in the browser, calling LLM APIs directly from the client.

### Data flow

```
useExperiment (hook) ─── orchestrates ──► runGeneration() ──► call() ──► provider API
       │                                        │
       │                               betweenGenerations()  (Agent-P, after each gen except last)
       │
       └── ExperimentState ──► App.tsx ──► tabs (LiveTab, ModelsTab, CoherenceTab, ReportTab)
```

**`useExperiment`** is the single source of truth. It owns all `ExperimentState` and drives the run loop: for each generation it calls `runGeneration()`, then (if not the last generation) calls `betweenGenerations()` for the perturbation step, then commits the completed `GenerationResult` to state.

### Agent roles

- **Agent-A** (Generator): produces philosophical concepts each round  
- **Agent-B** (Critic): evaluates each concept → `accepted | rejected | evolved`  
- **Agent-P** (Perturbador): runs *between* generations (not after the last); applies selective forgetting + semantic crossover to prevent convergence

### Key types (`src/types.ts`)

- `ExperimentConfig` — generations, rounds, `agentA/B/P` (each has `provider`, `model`, `apiKey`)
- `WorldModel` — `confirmedInsights[]`, `rejectedPaths[]`, `tensionPatterns[]`, `theoryOfOther`
- `TensionRecord` — one round's output: concept, definition, outcome, informationGain, stageCosts
- `PerturbationRecord` — Agent-P output between generations: perturbationA/B, rationale, cost
- `GenerationResult` — full gen: interactions[], worldModelA/B, coherence, distillCosts, optional perturbation

### API layer (`src/api/`)

All three providers share the same `call()` dispatcher in `index.ts`. Token costs for all models live in `anthropic.ts`'s `TOKEN_COSTS` map (including Grok). Response parsing (strip ` ```json ` fences, fallback to regex `{...}` match) is duplicated in each provider file — this is intentional to keep providers independent.

To add a new provider: create `src/api/<provider>.ts` mirroring `openai.ts`, add its models to `TOKEN_COSTS` in `anthropic.ts`, add it to `MODEL_CATALOG` in `src/config/models.ts`, update the `Provider` union in `types.ts`, and add a branch in `api/index.ts`.

### Model catalog (`src/config/models.ts`)

Single source of truth for which models belong to which provider. `defaultModelForProvider()` returns the first model in the list. `apiKeyEnvVar()` maps provider → the correct `VITE_*` env var.

### Coherence metric (`src/agents/evolution.ts`)

`calcCoherence = avgInformationGain * 0.6 + emergenceRate * 0.4`  
where emergenceRate = fraction of rounds with `outcome === 'evolved'`.

### Perturbation operators (`src/agents/worldModel.ts`)

- `applyPerturbation(wm, question, keepRatio=0.65)` — shuffles and truncates `confirmedInsights`, injects the question into `rejectedPaths`
- `crossoverTensions(wmA, wmB, ratio=0.25)` — samples 25% of each agent's `tensionPatterns` into the other

### UI structure

Single sidebar (ConfigPanel) + tabbed main area. Tabs: *En vivo* | *World Models* | *Coherencia* | *Reporte*. LiveTab interleaves `PerturbationCard` between generation groups in newest-first order. ReportTab includes perturbation costs in the breakdown table (shown on the first row of each generation).

### Environment variables (`.env`)

```
VITE_ANTHROPIC_API_KEY=
VITE_OPENAI_API_KEY=
VITE_GROK_API_KEY=
```

All are optional at startup — users can paste keys directly in the UI.

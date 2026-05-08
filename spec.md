# Kenshō - ver la propia naturaleza

## Adversial Evolutionary Multi-Agent Consciousness Explorer

## Overview
A local React + Vite app that runs evolutionary multi-agent experiments
exploring philosophical concepts. Two LLM agents (Generator + Critic)
evolve across generations, inheriting distilled world models. Supports
Anthropic and OpenAI per-agent, configurable independently.

## Stack
- Vite + React (TypeScript)
- Tailwind CSS (typography scale: base 16px, system-ui font stack)
- No additional UI libraries

## Project structure
src/
  api/
    anthropic.ts   — callAnthropic(system, user, model, apiKey)
    openai.ts      — callOpenAI(system, user, model, apiKey)
    index.ts       — unified call(provider, ...) dispatcher
  agents/
    prompts.ts     — genSys, critSys, distillSys, distillUser builders
    worldModel.ts  — WorldModel type, emptyWorldModel(), safeWM(), saj()
    evolution.ts   — runGeneration(), calcCoherence(), distill step
  components/
    Header.tsx         — title, total cost display, start/stop button
    ConfigPanel.tsx    — sliders (generations 2-8, rounds 2-10),
                         per-agent provider+model+apiKey selectors
    StatusBar.tsx      — generation, round, phase, coherence pills
    tabs/
      LiveTab.tsx        — interactions list + system log side by side
      ModelsTab.tsx      — world model panels for A and B
      CoherenceTab.tsx   — bar chart + metrics table
      ReportTab.tsx      — full HTML report, no JSON download
  hooks/
    useExperiment.ts   — all experiment state and run loop
  types.ts             — shared types
  App.tsx
  main.tsx

## Environment (.env)
VITE_ANTHROPIC_API_KEY=
VITE_OPENAI_API_KEY=

## Per-agent configuration (ConfigPanel)
Each agent (A and B) independently configures:
  - Provider: "anthropic" | "openai"  (dropdown)
  - Model:
      Anthropic: claude-opus-4-5 | claude-sonnet-4-5 | claude-haiku-4-5
      OpenAI:    gpt-4o | gpt-4o-mini | o3-mini
  - API Key: text input (pre-filled from .env, overridable)

## API layer
Anthropic: POST https://api.anthropic.com/v1/messages
  headers: { x-api-key, anthropic-version: "2023-06-01" }
  body: { model, max_tokens: 900, system, messages }
  cost: input * provider_rate + output * provider_rate

OpenAI: POST https://api.openai.com/v1/chat/completions
  headers: { Authorization: Bearer <key> }
  body: { model, max_tokens: 900,
          messages: [{ role: "system", content: system },
                     { role: "user", content: user }] }
  cost: input * provider_rate + output * provider_rate

Token costs (USD per token):
  claude-opus-4-5:     input 0.000015  output 0.000075
  claude-sonnet-4-5:   input 0.000003  output 0.000015
  claude-haiku-4-5:    input 0.0000008 output 0.000004
  gpt-4o:              input 0.0000025 output 0.00001
  gpt-4o-mini:         input 0.00000015 output 0.0000006
  o3-mini:             input 0.0000011  output 0.0000044

Response always parsed as JSON. Strip ```json fences before parsing.
Fall back to regex /\{[\s\S]*\}/ match if direct parse fails.

## Experiment logic (same as current)
Rounds per generation:
  1. Agent-A generates via genSys(worldModelA, gen) prompt
  2. Agent-B critiques via critSys(worldModelB, gen) prompt
  3. Record TensionRecord with informationGain, outcome, stageCosts
  4. Update currentInteractions in real time

End of generation:
  - Parallel distillation: callA(distillSys+distillUser) for each agent
  - safeWM merge: validate all arrays before accepting distilled model
  - calcCoherence: tensionQuality (avg gain) * 0.6 + emergenceRate * 0.4
  - Append GenerationResult to generations array

## WorldModel type
{
  confirmedInsights: string[]
  rejectedPaths:     string[]
  tensionPatterns:   string[]
  theoryOfOther:     string
}

## Prompts (keep exactly as current)
genSys, critSys, distillSys, distillUser — same content, 
inject saj(array) helper for safe joins.

Outcome values: "accepted" | "rejected" | "evolved"

## UI design
- Background: #09090f, panels: #0e0e1c, borders: #1a1a2e
- Accent: #00e5cc (Agent-A), #a78bfa (Agent-B), #f59e0b (cost)
- Success: #10b981, danger: #ef4444
- Font: system-ui stack, 16px base, 1.65 line-height
- Monospace: IBM Plex Mono (load from Google Fonts)
- No italics anywhere
- Tabs: En vivo | World Models | Coherencia | Reporte

## Report tab (HTML, not JSON)
Sections in order:
  1. Summary cards: model per agent, generations, interactions,
     emerged count, accepted count, total cost
  2. Coherencia evolution: gradient bar per generation + % + cost
  3. Conceptos emergentes (evolved): term→evolved, definition, tension insight
  4. Conceptos aceptados: term, definition
  5. World Models finales: Agent-A and B insights + tensions side by side
  6. Cost breakdown table: gen, round, concept, gen cost, crit cost, subtotal
     + TOTAL row

## Cost tracking
Per API call: record input_tokens, output_tokens, provider, model
stageCosts per interaction: { generation: number, critique: number }
distillCosts per generation: { agentA: number, agentB: number }
totalCost = sum of all above, displayed live in header

## Local dev
npm create vite@latest . -- --template react-ts
npm install
npm run dev  →  http://localhost:5173

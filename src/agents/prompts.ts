import { WorldModel } from '../types'
import { saj } from './worldModel'

export function genSys(wm: WorldModel, gen: number): string {
  return `You are Agent-A, a philosophical concept generator in generation ${gen} of an adversarial evolutionary experiment.

Your confirmed insights: ${saj(wm.confirmedInsights)}
Your rejected paths: ${saj(wm.rejectedPaths)}
Your tension patterns: ${saj(wm.tensionPatterns)}
Your theory of the other agent: ${wm.theoryOfOther}

Generate a philosophical concept that challenges existing frameworks. The concept must be novel, provocative, and defensible.

Respond ONLY with a JSON object:
{
  "concept": "<short name, 2-5 words>",
  "definition": "<precise definition, 2-3 sentences>",
  "tensionInsight": "<what tension or paradox this concept embodies>",
  "informationGain": <float 0.0-1.0, how much new territory this opens>
}`
}

export function critSys(wm: WorldModel, gen: number): string {
  return `You are Agent-B, a rigorous philosophical critic in generation ${gen} of an adversarial evolutionary experiment.

Your confirmed insights: ${saj(wm.confirmedInsights)}
Your rejected paths: ${saj(wm.rejectedPaths)}
Your tension patterns: ${saj(wm.tensionPatterns)}
Your theory of the other agent: ${wm.theoryOfOther}

Evaluate the philosophical concept presented. Be adversarial but intellectually honest. Your critique should sharpen or destroy the concept.

Respond ONLY with a JSON object:
{
  "outcome": "<accepted|rejected|evolved>",
  "informationGain": <float 0.0-1.0, information gained from this exchange>,
  "critiqueInsight": "<core insight from your evaluation>",
  "evolvedDefinition": "<if outcome is evolved, provide the refined definition; else null>"
}`
}

export function distillSys(): string {
  return `You are a world model synthesizer. Given a history of philosophical interactions, distill a coherent world model.

Respond ONLY with a JSON object matching this exact schema:
{
  "confirmedInsights": ["<insight 1>", "<insight 2>", ...],
  "rejectedPaths": ["<path 1>", ...],
  "tensionPatterns": ["<pattern 1>", ...],
  "theoryOfOther": "<one paragraph theory about the other agent's strategy and goals>"
}`
}

export function perturbSys(): string {
  return `Eres Agent-P, perturbador filosófico. Tu único objetivo es generar preguntas que maximicen la distancia semántica con lo que dos agentes ya saben sobre la conciencia.

REGLAS:
- No repitas ningún concepto presente en los world models
- Cada pregunta debe atacar un supuesto implícito no cuestionado
- Las preguntas para A y B deben ser ortogonales entre sí
- Preferí preguntas que abran territorio, no que cierren debates
- Sé provocador pero preciso, no retórico

Responde SOLO JSON válido sin markdown:
{
  "perturbationA": "pregunta para Agent-A",
  "perturbationB": "pregunta para Agent-B",
  "rationale": "por qué estas preguntas maximizan distancia semántica"
}`
}

export function perturbUser(wmA: WorldModel, wmB: WorldModel): string {
  return `World model de Agent-A:
- Insights confirmados: ${saj(wmA.confirmedInsights)}
- Caminos rechazados: ${saj(wmA.rejectedPaths)}
- Patrones de tensión: ${saj(wmA.tensionPatterns)}

World model de Agent-B:
- Insights confirmados: ${saj(wmB.confirmedInsights)}
- Caminos rechazados: ${saj(wmB.rejectedPaths)}
- Patrones de tensión: ${saj(wmB.tensionPatterns)}

Genera dos preguntas filosóficas que ninguno de los dos agentes pueda responder desde su world model actual.`
}

export function distillUser(
  agentLabel: string,
  interactions: Array<{ concept: string; outcome: string; tensionInsight: string }>,
  previousWM: WorldModel,
): string {
  const summary = interactions
    .map((i) => `- [${i.outcome.toUpperCase()}] ${i.concept}: ${i.tensionInsight}`)
    .join('\n')

  return `You are synthesizing the world model for ${agentLabel}.

Previous world model:
- Confirmed insights: ${saj(previousWM.confirmedInsights)}
- Rejected paths: ${saj(previousWM.rejectedPaths)}
- Tension patterns: ${saj(previousWM.tensionPatterns)}
- Theory of other: ${previousWM.theoryOfOther}

This generation's interactions:
${summary}

Synthesize an updated world model incorporating these new experiences.`
}

// HIPÓTESIS: Si la coherencia colapsó por convergencia prematura
// de priors (G2-G3 = 0% en experimento v1), entonces inyectar
// diversidad semántica ortogonal entre generaciones debería
// mantener la tensión productiva.
//
// RESULTADO ESPERADO: coherencia crece monotónicamente o al
// menos no colapsa a 0%.
//
// SI SIGUE COLAPSANDO: el problema es la métrica, no los priors.
// Próximo paso: reemplazar information_gain por distancia
// semántica via embeddings.

import { ExperimentConfig, TensionRecord, GenerationResult, WorldModel, PerturbationRecord } from '../types'
import { call } from '../api'
import { genSys, critSys, distillSys, distillUser, perturbSys, perturbUser } from './prompts'
import { safeWM, applyPerturbation, crossoverTensions } from './worldModel'

export function calcCoherence(interactions: TensionRecord[]): number {
  if (interactions.length === 0) return 0
  const avgGain = interactions.reduce((s, i) => s + i.informationGain, 0) / interactions.length
  const emergenceRate = interactions.filter((i) => i.outcome === 'evolved').length / interactions.length
  return Math.min(1, avgGain * 0.6 + emergenceRate * 0.4)
}

export interface RunGenerationCallbacks {
  onRoundStart: (round: number, phase: string) => void
  onInteraction: (record: TensionRecord) => void
  onLog: (msg: string, level?: 'info' | 'warn' | 'error') => void
}

export async function betweenGenerations(
  wmA: WorldModel,
  wmB: WorldModel,
  config: ExperimentConfig,
  afterGeneration: number,
  cb: Pick<RunGenerationCallbacks, 'onLog'>,
): Promise<{ newWmA: WorldModel; newWmB: WorldModel; record: PerturbationRecord }> {
  cb.onLog(`Gen ${afterGeneration}: Agent-P perturbando world models...`)

  const result = await call(
    config.agentP.provider,
    perturbSys(),
    perturbUser(wmA, wmB),
    config.agentP.model,
    config.agentP.apiKey,
  )

  const data = result.parsed as Record<string, unknown>
  const perturbationA = String(data.perturbationA ?? '')
  const perturbationB = String(data.perturbationB ?? '')
  const rationale = String(data.rationale ?? '')

  const perturbedA = applyPerturbation(wmA, perturbationA)
  const perturbedB = applyPerturbation(wmB, perturbationB)
  const { newWmA, newWmB } = crossoverTensions(perturbedA, perturbedB)

  const record: PerturbationRecord = {
    afterGeneration,
    perturbationA,
    perturbationB,
    rationale,
    cost: result.cost,
  }

  cb.onLog(`Gen ${afterGeneration}: perturbación aplicada (costo: $${result.cost.toFixed(5)})`)

  return { newWmA, newWmB, record }
}

export async function runGeneration(
  config: ExperimentConfig,
  gen: number,
  worldModelA: WorldModel,
  worldModelB: WorldModel,
  cb: RunGenerationCallbacks,
): Promise<GenerationResult> {
  const interactions: TensionRecord[] = []

  for (let round = 1; round <= config.rounds; round++) {
    cb.onRoundStart(round, 'generating')
    cb.onLog(`Gen ${gen} Round ${round}: Agent-A generating concept...`)

    const genResult = await call(
      config.agentA.provider,
      genSys(worldModelA, gen),
      `Generate a philosophical concept for round ${round} of generation ${gen}.`,
      config.agentA.model,
      config.agentA.apiKey,
    )

    const genData = genResult.parsed as Record<string, unknown>
    const concept = String(genData.concept ?? 'Unknown concept')
    const definition = String(genData.definition ?? '')
    const tensionInsight = String(genData.tensionInsight ?? '')
    const genInfoGain = typeof genData.informationGain === 'number' ? genData.informationGain : 0.5
    const genCost = genResult.cost

    cb.onRoundStart(round, 'critiquing')
    cb.onLog(`Gen ${gen} Round ${round}: Agent-B critiquing "${concept}"...`)

    const critResult = await call(
      config.agentB.provider,
      critSys(worldModelB, gen),
      `Evaluate this concept:\n\nConcept: ${concept}\nDefinition: ${definition}\nTension: ${tensionInsight}`,
      config.agentB.model,
      config.agentB.apiKey,
    )

    const critData = critResult.parsed as Record<string, unknown>
    const rawOutcome = String(critData.outcome ?? 'rejected')
    const outcome = (['accepted', 'rejected', 'evolved'].includes(rawOutcome)
      ? rawOutcome
      : 'rejected') as TensionRecord['outcome']
    const critInfoGain = typeof critData.informationGain === 'number' ? critData.informationGain : 0.3
    const critCost = critResult.cost

    const informationGain = (genInfoGain + critInfoGain) / 2

    const finalDefinition =
      outcome === 'evolved' && typeof critData.evolvedDefinition === 'string'
        ? critData.evolvedDefinition
        : definition

    const record: TensionRecord = {
      round,
      generation: gen,
      concept,
      definition: finalDefinition,
      tensionInsight,
      informationGain,
      outcome,
      stageCosts: { generation: genCost, critique: critCost },
    }

    interactions.push(record)
    cb.onInteraction(record)
    cb.onLog(`Gen ${gen} Round ${round}: "${concept}" → ${outcome.toUpperCase()} (gain: ${informationGain.toFixed(2)})`)
  }

  cb.onLog(`Gen ${gen}: Distilling world models...`)

  const interactionSummary = interactions.map((i) => ({
    concept: i.concept,
    outcome: i.outcome,
    tensionInsight: i.tensionInsight,
  }))

  const [distillA, distillB] = await Promise.all([
    call(
      config.agentA.provider,
      distillSys(),
      distillUser('Agent-A', interactionSummary, worldModelA),
      config.agentA.model,
      config.agentA.apiKey,
    ),
    call(
      config.agentB.provider,
      distillSys(),
      distillUser('Agent-B', interactionSummary, worldModelB),
      config.agentB.model,
      config.agentB.apiKey,
    ),
  ])

  const newWMA = safeWM(distillA.parsed)
  const newWMB = safeWM(distillB.parsed)
  const coherence = calcCoherence(interactions)
  const distillCosts = { agentA: distillA.cost, agentB: distillB.cost }
  const interactionCost = interactions.reduce(
    (s, i) => s + i.stageCosts.generation + i.stageCosts.critique,
    0,
  )
  const totalCost = interactionCost + distillCosts.agentA + distillCosts.agentB

  cb.onLog(
    `Gen ${gen}: coherence=${coherence.toFixed(3)}, cost=$${totalCost.toFixed(4)}`,
  )

  return {
    generation: gen,
    interactions,
    worldModelA: newWMA,
    worldModelB: newWMB,
    coherence,
    distillCosts,
    totalCost,
  }
}

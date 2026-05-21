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

import { ExperimentConfig, TensionRecord, GenerationResult, WorldModel, PerturbationRecord, EntropicRoundMetrics, EntropicGenMetrics } from '../types'
import { call } from '../api'
import { genSys, critSys, distillSys, distillUser, perturbSys, perturbUser } from './prompts'
import { safeWM, applyPerturbation, crossoverTensions, serializeWM } from './worldModel'
import { Strings } from '../i18n'
import { embed, cosineSim } from '../utils/embeddings'

export function calcCoherence(interactions: TensionRecord[]): number {
  if (interactions.length === 0) return 0
  const avgGain = interactions.reduce((s, i) => s + i.informationGain, 0) / interactions.length
  const emergenceRate = interactions.filter((i) => i.outcome === 'evolved').length / interactions.length
  return Math.min(1, avgGain * 0.6 + emergenceRate * 0.4)
}

export function calcEntropicCoherence(outcomeEntropy: number, avgCosineDistance: number): number {
  return Math.min(1, outcomeEntropy * 0.5 + avgCosineDistance * 0.5)
}

function entropyOfDistribution(counts: Record<string, number>): number {
  const total = Object.values(counts).reduce((s, c) => s + c, 0)
  if (total === 0) return 0
  let h = 0
  for (const count of Object.values(counts)) {
    const p = count / total
    if (p > 0) h -= p * Math.log2(p)
  }
  return h
}

export interface RunGenerationCallbacks {
  onRoundStart: (round: number, phase: string) => void
  onInteraction: (record: TensionRecord) => void
  onLog: (msg: string, level?: 'info' | 'warn' | 'error') => void
  t: Strings
}

export async function betweenGenerations(
  wmA: WorldModel,
  wmB: WorldModel,
  config: ExperimentConfig,
  afterGeneration: number,
  cb: Pick<RunGenerationCallbacks, 'onLog' | 't'>,
): Promise<{ newWmA: WorldModel; newWmB: WorldModel; record: PerturbationRecord }> {
  cb.onLog(cb.t.logPerturbing(afterGeneration))

  const result = await call(
    config.agentP.provider,
    perturbSys(config.lang),
    perturbUser(wmA, wmB, config.lang),
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

  cb.onLog(cb.t.logPerturbApplied(afterGeneration, result.cost.toFixed(5)))

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
  const entropicRoundMetrics: EntropicRoundMetrics[] = []
  let prevConceptEmbedding: number[] | null = null
  const wmASerialized = serializeWM(worldModelA)

  for (let round = 1; round <= config.rounds; round++) {
    cb.onRoundStart(round, cb.t.phaseGenerating)
    cb.onLog(cb.t.logGenerating(gen, round))

    const genUser = config.lang === 'es'
      ? `Genera un concepto filosófico para la ronda ${round} de la generación ${gen}.`
      : `Generate a philosophical concept for round ${round} of generation ${gen}.`

    const genResult = await call(
      config.agentA.provider,
      genSys(worldModelA, gen, config.lang),
      genUser,
      config.agentA.model,
      config.agentA.apiKey,
    )

    const genData = genResult.parsed as Record<string, unknown>
    const concept = String(genData.concept ?? 'Unknown concept')
    const definition = String(genData.definition ?? '')
    const tensionInsight = String(genData.tensionInsight ?? '')
    const genInfoGain = typeof genData.informationGain === 'number' ? genData.informationGain : 0.5
    const genCost = genResult.cost

    cb.onRoundStart(round, cb.t.phaseCritiquing)
    cb.onLog(cb.t.logCritiquing(gen, round, concept))

    const critUser = config.lang === 'es'
      ? `Evalúa este concepto:\n\nConcepto: ${concept}\nDefinición: ${definition}\nTensión: ${tensionInsight}`
      : `Evaluate this concept:\n\nConcept: ${concept}\nDefinition: ${definition}\nTension: ${tensionInsight}`

    const critResult = await call(
      config.agentB.provider,
      critSys(worldModelB, gen, config.lang),
      critUser,
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
    cb.onLog(cb.t.logInteraction(gen, round, concept, outcome.toUpperCase(), informationGain.toFixed(2)))

    // Entropic metrics calculation
    if (config.experimentType === 'entropic') {
      try {
        const conceptEmbedding = await embed(concept, config)
        let cosineFromPrev = 0
        if (prevConceptEmbedding) {
          cosineFromPrev = cosineSim(conceptEmbedding, prevConceptEmbedding)
        }
        const wmEmbedding = await embed(wmASerialized, config)
        const divergenceFromWM = cosineSim(conceptEmbedding, wmEmbedding)

        entropicRoundMetrics.push({
          round,
          generation: gen,
          conceptEmbedding,
          cosineFromPrev,
          divergenceFromWM,
          surpriseProxy: 1 - cosineFromPrev,
        })

        prevConceptEmbedding = conceptEmbedding
      } catch (err) {
        cb.onLog(`Failed to compute embeddings for round ${round}: ${String(err)}`, 'warn')
      }
    }
  }

  cb.onLog(cb.t.logDistilling(gen))

  const interactionSummary = interactions.map((i) => ({
    concept: i.concept,
    outcome: i.outcome,
    tensionInsight: i.tensionInsight,
  }))

  const [distillA, distillB] = await Promise.all([
    call(
      config.agentA.provider,
      distillSys(config.lang),
      distillUser('Agent-A', interactionSummary, worldModelA, config.lang),
      config.agentA.model,
      config.agentA.apiKey,
      4000,
    ),
    call(
      config.agentB.provider,
      distillSys(config.lang),
      distillUser('Agent-B', interactionSummary, worldModelB, config.lang),
      config.agentB.model,
      config.agentB.apiKey,
      4000,
    ),
  ])

  const newWMA = safeWM(distillA.parsed)
  const newWMB = safeWM(distillB.parsed)

  // Calculate coherence (different formula for entropic type)
  let coherence = calcCoherence(interactions)
  let entropicMetrics: EntropicGenMetrics | undefined

  if (config.experimentType === 'entropic') {
    const outcomeCounts = { accepted: 0, rejected: 0, evolved: 0 }
    for (const i of interactions) {
      outcomeCounts[i.outcome]++
    }
    const outcomeEntropy = entropyOfDistribution(outcomeCounts)
    const avgCosineDistance = entropicRoundMetrics.length > 0
      ? entropicRoundMetrics.reduce((s, m) => s + m.cosineFromPrev, 0) / entropicRoundMetrics.length
      : 0
    const newInsights = newWMA.confirmedInsights.length - worldModelA.confirmedInsights.length
    const wmChangeRate = worldModelA.confirmedInsights.length > 0
      ? newInsights / worldModelA.confirmedInsights.length
      : 0

    entropicMetrics = {
      generation: gen,
      outcomeEntropy,
      avgCosineDistance,
      wmChangeRate,
      wmSizeA: newWMA.confirmedInsights.length + newWMA.tensionPatterns.length,
      wmSizeB: newWMB.confirmedInsights.length + newWMB.tensionPatterns.length,
      roundMetrics: entropicRoundMetrics,
    }

    coherence = calcEntropicCoherence(outcomeEntropy, avgCosineDistance)
  }

  const distillCosts = { agentA: distillA.cost, agentB: distillB.cost }
  const interactionCost = interactions.reduce(
    (s, i) => s + i.stageCosts.generation + i.stageCosts.critique,
    0,
  )
  const totalCost = interactionCost + distillCosts.agentA + distillCosts.agentB

  cb.onLog(cb.t.logCoherence(gen, coherence.toFixed(3), totalCost.toFixed(4)))

  const result: GenerationResult = {
    generation: gen,
    interactions,
    worldModelA: newWMA,
    worldModelB: newWMB,
    coherence,
    distillCosts,
    totalCost,
  }

  if (entropicMetrics) {
    result.entropicMetrics = entropicMetrics
  }

  return result
}

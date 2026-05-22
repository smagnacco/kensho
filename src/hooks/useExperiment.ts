import { useState, useRef, useCallback } from 'react'
import { ExperimentConfig, ExperimentState, TensionRecord, PerturbationRecord } from '../types'
import { emptyWorldModel } from '../agents/worldModel'
import { runGeneration, betweenGenerations } from '../agents/evolution'
import { STRINGS } from '../i18n'

const defaultConfig: ExperimentConfig = {
  generations: 3,
  rounds: 3,
  lang: 'es',
  experimentType: 'heuristic',
  disablePerturbation: false,
  agentA: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
  },
  agentB: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
  },
  agentP: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
  },
}

const initialState: ExperimentState = {
  status: 'idle',
  currentGeneration: 0,
  currentRound: 0,
  currentPhase: '',
  coherence: 0,
  totalCost: 0,
  generations: [],
  currentInteractions: [],
  worldModelA: emptyWorldModel(),
  worldModelB: emptyWorldModel(),
  perturbations: [],
  log: [],
  error: null,
  entropicData: [],
}

export function useExperiment() {
  const [config, setConfig] = useState<ExperimentConfig>(defaultConfig)
  const [state, setState] = useState<ExperimentState>(initialState)
  const abortRef = useRef(false)

  const updateState = useCallback((patch: Partial<ExperimentState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const appendLog = useCallback((message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const entry = {
      timestamp: new Date().toISOString().slice(11, 19),
      message,
      level,
    }
    setState((prev) => ({ ...prev, log: [...prev.log.slice(-200), entry] }))
  }, [])

  const start = useCallback(async () => {
    abortRef.current = false
    const t = STRINGS[config.lang]

    setState({
      ...initialState,
      status: 'running',
      log: [{ timestamp: new Date().toISOString().slice(11, 19), message: t.logStarted, level: 'info' }],
    })

    let wmA = emptyWorldModel()
    let wmB = emptyWorldModel()

    try {
      for (let gen = 1; gen <= config.generations; gen++) {
        if (abortRef.current) break

        updateState({ currentGeneration: gen, currentInteractions: [] })

        const result = await runGeneration(config, gen, wmA, wmB, {
          onRoundStart: (round, phase) => {
            updateState({ currentRound: round, currentPhase: phase })
          },
          onInteraction: (record: TensionRecord) => {
            setState((prev) => ({
              ...prev,
              currentInteractions: [...prev.currentInteractions, record],
              totalCost: prev.totalCost + record.stageCosts.generation + record.stageCosts.critique,
            }))
          },
          onLog: appendLog,
          t,
        })

        if (abortRef.current) break

        wmA = result.worldModelA
        wmB = result.worldModelB

        let perturbRecord: PerturbationRecord | undefined
        if (gen < config.generations && !abortRef.current && !config.disablePerturbation) {
          updateState({ currentPhase: 'perturbing' })
          const perturbResult = await betweenGenerations(wmA, wmB, config, gen, { onLog: appendLog, t })
          wmA = perturbResult.newWmA
          wmB = perturbResult.newWmB
          perturbRecord = perturbResult.record

          setState((prev) => ({
            ...prev,
            perturbations: [...prev.perturbations, perturbResult.record],
            totalCost: prev.totalCost + perturbResult.record.cost,
          }))
        }

        const generationWithPerturbation = { ...result, perturbation: perturbRecord }
        const patch: Partial<ExperimentState> = {
          generations: [...state.generations, generationWithPerturbation],
          worldModelA: wmA,
          worldModelB: wmB,
          coherence: result.coherence,
          totalCost: state.totalCost + result.distillCosts.agentA + result.distillCosts.agentB,
          currentInteractions: [],
        }

        if (result.entropicMetrics) {
          patch.entropicData = [...state.entropicData, result.entropicMetrics]
        }

        setState((prev) => ({ ...prev, ...patch }))
      }

      updateState({
        status: abortRef.current ? 'idle' : 'done',
        currentPhase: abortRef.current ? t.phaseStopped : t.phaseComplete,
      })
      appendLog(abortRef.current ? t.logStopped : t.logComplete)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      updateState({ status: 'error', error: message, currentPhase: t.phaseError })
      appendLog(`${t.phaseError}: ${message}`, 'error')
    }
  }, [config, updateState, appendLog])

  const stop = useCallback(() => {
    const t = STRINGS[config.lang]
    abortRef.current = true
    updateState({ currentPhase: t.phaseStopping })
    appendLog(t.logStopRequested, 'warn')
  }, [config.lang, updateState, appendLog])

  return { config, setConfig, state, start, stop }
}

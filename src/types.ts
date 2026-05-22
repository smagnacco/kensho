export type Provider = 'anthropic' | 'openai' | 'grok'

export type AnthropicModel = 'claude-opus-4-5' | 'claude-sonnet-4-5' | 'claude-haiku-4-5'
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'o3-mini'
export type GrokModel = 'grok-3' | 'grok-3-mini' | 'grok-2-vision'
export type ModelId = AnthropicModel | OpenAIModel | GrokModel

export interface AgentConfig {
  provider: Provider
  model: ModelId
  apiKey: string
}

export type ExperimentType = 'heuristic' | 'entropic'

export interface ExperimentConfig {
  generations: number
  rounds: number
  agentA: AgentConfig
  agentB: AgentConfig
  agentP: AgentConfig
  lang: 'en' | 'es'
  experimentType: ExperimentType
  disablePerturbation: boolean
}

export interface WorldModel {
  confirmedInsights: string[]
  rejectedPaths: string[]
  tensionPatterns: string[]
  theoryOfOther: string
}

export type Outcome = 'accepted' | 'rejected' | 'evolved'

export interface StageCosts {
  generation: number
  critique: number
}

export interface TensionRecord {
  round: number
  generation: number
  concept: string
  definition: string
  tensionInsight: string
  informationGain: number
  outcome: Outcome
  stageCosts: StageCosts
}

export interface DistillCosts {
  agentA: number
  agentB: number
}

export interface PerturbationRecord {
  afterGeneration: number
  perturbationA: string
  perturbationB: string
  rationale: string
  cost: number
}

export interface EntropicRoundMetrics {
  round: number
  generation: number
  conceptEmbedding: number[]
  cosineFromPrev: number
  divergenceFromWM: number
  surpriseProxy: number
}

export interface EntropicGenMetrics {
  generation: number
  outcomeEntropy: number
  avgCosineDistance: number
  wmChangeRate: number
  wmSizeA: number
  wmSizeB: number
  roundMetrics: EntropicRoundMetrics[]
}

export interface GenerationResult {
  generation: number
  interactions: TensionRecord[]
  worldModelA: WorldModel
  worldModelB: WorldModel
  coherence: number
  distillCosts: DistillCosts
  totalCost: number
  perturbation?: PerturbationRecord
  entropicMetrics?: EntropicGenMetrics
}

export interface LogEntry {
  timestamp: string
  message: string
  level: 'info' | 'warn' | 'error'
}

export interface ExperimentState {
  status: 'idle' | 'running' | 'done' | 'error'
  currentGeneration: number
  currentRound: number
  currentPhase: string
  coherence: number
  totalCost: number
  generations: GenerationResult[]
  currentInteractions: TensionRecord[]
  worldModelA: WorldModel
  worldModelB: WorldModel
  perturbations: PerturbationRecord[]
  log: LogEntry[]
  error: string | null
  entropicData: EntropicGenMetrics[]
}

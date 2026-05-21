export type Lang = 'en' | 'es'

export interface Strings {
  // Header
  subtitle: string
  totalCost: string
  start: string
  restart: string
  stop: string

  // StatusBar
  status: string
  generation: string
  round: string
  phase: string
  coherence: string
  phaseGenerating: string
  phaseCritiquing: string
  phaseDistilling: string
  phasePerturbing: string
  phaseStopping: string
  phaseComplete: string
  phaseStopped: string
  phaseError: string

  // ConfigPanel
  configuration: string
  generations: string
  roundsPerGeneration: string
  provider: string
  model: string
  apiKey: string
  agentA: string
  agentB: string
  agentP: string
  agentPNote: string
  language: string
  experimentType: string
  heuristic: string
  entropic: string
  embeddingBackend: string
  transformersOffline: string
  openaiApi: string
  disablePerturbation: string

  // Tabs
  tabLive: string
  tabModels: string
  tabCoherence: string
  tabReport: string
  tabEntropy: string
  tabEmbeddings: string

  // LiveTab
  interactions: string
  systemLog: string
  waitingForExperiment: string
  waiting: string
  tension: string
  gain: string
  cost: string
  perturbationHeader: string
  perturbationAgentA: string
  perturbationAgentB: string
  rationale: string

  // ModelsTab
  confirmedInsights: string
  rejectedPaths: string
  tensionPatterns: string
  theoryOfOther: string
  noneYet: string
  agentAGenerator: string
  agentBCritic: string

  // CoherenceTab
  coherenceEvolution: string
  noCoherenceData: string
  rounds: string
  accepted: string
  evolved: string
  rejected: string

  // ReportTab
  summary: string
  modelA: string
  modelB: string
  modelP: string
  totalInteractions: string
  emerged: string
  emergedConcepts: string
  perturbationsBetweenGenerations: string
  acceptedConcepts: string
  finalWorldModels: string
  insights: string
  tensionPatternsLabel: string
  costBreakdown: string
  gen: string
  concept: string
  perturbation: string
  subtotal: string
  total: string
  noReportData: string
  evolvedLabel: string
  tensionLabel: string
  agentAReceived: string
  agentBReceived: string
  rationaleLabel: string
  critique: string
  exportReport: string
  outcomeEntropy: string
  cosineDistance: string
  surpriseProxy: string
  wmChangeRate: string
  wmSize: string
  entropicCoherenceNote: string

  // Log messages
  logStarted: string
  logStopped: string
  logComplete: string
  logStopRequested: string
  logGenerating: (gen: number, round: number) => string
  logCritiquing: (gen: number, round: number, concept: string) => string
  logInteraction: (gen: number, round: number, concept: string, outcome: string, gain: string) => string
  logDistilling: (gen: number) => string
  logCoherence: (gen: number, coherence: string, cost: string) => string
  logPerturbing: (gen: number) => string
  logPerturbApplied: (gen: number, cost: string) => string
}

const en: Strings = {
  subtitle: 'see one\'s true nature — adversarial evolutionary consciousness explorer',
  totalCost: 'total cost',
  start: 'Start',
  restart: 'Restart',
  stop: 'Stop',

  status: 'status',
  generation: 'generation',
  round: 'round',
  phase: 'phase',
  coherence: 'coherence',
  phaseGenerating: 'generating',
  phaseCritiquing: 'critiquing',
  phaseDistilling: 'distilling',
  phasePerturbing: 'Perturbing',
  phaseStopping: 'Stopping...',
  phaseComplete: 'Complete',
  phaseStopped: 'Stopped',
  phaseError: 'Error',

  configuration: 'Configuration',
  generations: 'Generations',
  roundsPerGeneration: 'Rounds per generation',
  provider: 'Provider',
  model: 'Model',
  apiKey: 'API Key',
  agentA: 'Agent-A · Generator',
  agentB: 'Agent-B · Critic',
  agentP: 'Agent-P · Perturber',
  agentPNote: 'Runs between generations, Haiku by default',
  language: 'Language',
  experimentType: 'Experiment Type',
  heuristic: 'Heuristic',
  entropic: 'Entropic',
  embeddingBackend: 'Embedding Backend',
  transformersOffline: 'transformers.js (offline)',
  openaiApi: 'OpenAI API',
  disablePerturbation: 'Disable Perturbation',

  tabLive: 'Live',
  tabModels: 'World Models',
  tabCoherence: 'Coherence',
  tabReport: 'Report',
  tabEntropy: 'Entropy',
  tabEmbeddings: 'Embeddings',

  interactions: 'interactions',
  systemLog: 'system log',
  waitingForExperiment: 'Start the experiment to see interactions in real time.',
  waiting: 'waiting...',
  tension: 'Tension',
  gain: 'gain',
  cost: 'cost',
  perturbationHeader: 'PERTURBATION',
  perturbationAgentA: '→ Agent-A:',
  perturbationAgentB: '→ Agent-B:',
  rationale: 'Rationale',

  confirmedInsights: 'Confirmed insights',
  rejectedPaths: 'Rejected paths',
  tensionPatterns: 'Tension patterns',
  theoryOfOther: 'Theory of the other',
  noneYet: '(none yet)',
  agentAGenerator: 'Agent-A (Generator)',
  agentBCritic: 'Agent-B (Critic)',

  coherenceEvolution: 'Coherence evolution',
  noCoherenceData: 'Coherence data will appear after the first generation.',
  rounds: 'Rounds',
  accepted: 'Accepted',
  evolved: 'Evolved',
  rejected: 'Rejected',

  summary: 'Summary',
  modelA: 'Model A',
  modelB: 'Model B',
  modelP: 'Model P',
  totalInteractions: 'Interactions',
  emerged: 'Emerged',
  emergedConcepts: 'Emerged concepts (evolved)',
  perturbationsBetweenGenerations: 'Perturbations between generations',
  acceptedConcepts: 'Accepted concepts',
  finalWorldModels: 'Final world models',
  insights: 'Insights',
  tensionPatternsLabel: 'Tension patterns',
  costBreakdown: 'Cost breakdown',
  gen: 'Gen',
  concept: 'Concept',
  perturbation: 'Perturbation',
  subtotal: 'Subtotal',
  total: 'TOTAL',
  noReportData: 'The report will appear when the experiment finishes.',
  evolvedLabel: '→ evolved',
  tensionLabel: 'Tension:',
  agentAReceived: 'Agent-A received:',
  agentBReceived: 'Agent-B received:',
  rationaleLabel: 'Rationale:',
  critique: 'Critique',
  exportReport: 'Export Report',
  outcomeEntropy: 'Outcome Entropy',
  cosineDistance: 'Cosine Distance',
  surpriseProxy: 'Surprise Index',
  wmChangeRate: 'WM Change Rate',
  wmSize: 'World Model Size',
  entropicCoherenceNote: 'In entropic mode, coherence measures chaos (peak = max chaos, collapse = insight)',

  logStarted: 'Experiment started',
  logStopped: 'Experiment stopped by user',
  logComplete: 'Experiment complete',
  logStopRequested: 'Stop requested...',
  logGenerating: (gen, round) => `Gen ${gen} Round ${round}: Agent-A generating concept...`,
  logCritiquing: (gen, round, concept) => `Gen ${gen} Round ${round}: Agent-B critiquing "${concept}"...`,
  logInteraction: (gen, round, concept, outcome, gain) =>
    `Gen ${gen} Round ${round}: "${concept}" → ${outcome} (gain: ${gain})`,
  logDistilling: (gen) => `Gen ${gen}: Distilling world models...`,
  logCoherence: (gen, coherence, cost) => `Gen ${gen}: coherence=${coherence}, cost=$${cost}`,
  logPerturbing: (gen) => `Gen ${gen}: Agent-P perturbing world models...`,
  logPerturbApplied: (gen, cost) => `Gen ${gen}: perturbation applied (cost: $${cost})`,
}

const es: Strings = {
  subtitle: 'ver la propia naturaleza — explorador evolutivo adversarial de conciencia',
  totalCost: 'costo total',
  start: 'Iniciar',
  restart: 'Reiniciar',
  stop: 'Detener',

  status: 'estado',
  generation: 'generación',
  round: 'ronda',
  phase: 'fase',
  coherence: 'coherencia',
  phaseGenerating: 'generando',
  phaseCritiquing: 'criticando',
  phaseDistilling: 'destilando',
  phasePerturbing: 'Perturbando',
  phaseStopping: 'Deteniendo...',
  phaseComplete: 'Completo',
  phaseStopped: 'Detenido',
  phaseError: 'Error',

  configuration: 'Configuracion',
  generations: 'Generaciones',
  roundsPerGeneration: 'Rondas por generacion',
  provider: 'Proveedor',
  model: 'Modelo',
  apiKey: 'API Key',
  agentA: 'Agent-A · Generador',
  agentB: 'Agent-B · Critico',
  agentP: 'Agent-P · Perturbador',
  agentPNote: 'Se ejecuta entre generaciones con Haiku por defecto',
  language: 'Idioma',
  experimentType: 'Tipo de Experimento',
  heuristic: 'Heurístico',
  entropic: 'Entropico',
  embeddingBackend: 'Motor de Embeddings',
  transformersOffline: 'transformers.js (offline)',
  openaiApi: 'OpenAI API',
  disablePerturbation: 'Sin Perturbación',

  tabLive: 'En vivo',
  tabModels: 'World Models',
  tabCoherence: 'Coherencia',
  tabReport: 'Reporte',
  tabEntropy: 'Entropía',
  tabEmbeddings: 'Embeddings',

  interactions: 'interacciones',
  systemLog: 'log del sistema',
  waitingForExperiment: 'Inicia el experimento para ver las interacciones en tiempo real.',
  waiting: 'esperando...',
  tension: 'Tension',
  gain: 'ganancia',
  cost: 'costo',
  perturbationHeader: 'PERTURBACIÓN',
  perturbationAgentA: '→ Agent-A:',
  perturbationAgentB: '→ Agent-B:',
  rationale: 'Racional',

  confirmedInsights: 'Insights confirmados',
  rejectedPaths: 'Caminos rechazados',
  tensionPatterns: 'Patrones de tension',
  theoryOfOther: 'Teoria del otro',
  noneYet: '(ninguno aun)',
  agentAGenerator: 'Agent-A (Generador)',
  agentBCritic: 'Agent-B (Critico)',

  coherenceEvolution: 'Evolucion de coherencia',
  noCoherenceData: 'Los datos de coherencia apareceran despues de la primera generacion.',
  rounds: 'Rondas',
  accepted: 'Aceptados',
  evolved: 'Evolucionados',
  rejected: 'Rechazados',

  summary: 'Resumen',
  modelA: 'Modelo A',
  modelB: 'Modelo B',
  modelP: 'Modelo P',
  totalInteractions: 'Interacciones',
  emerged: 'Emergidos',
  emergedConcepts: 'Conceptos emergentes (evolucionados)',
  perturbationsBetweenGenerations: 'Perturbaciones entre generaciones',
  acceptedConcepts: 'Conceptos aceptados',
  finalWorldModels: 'World Models finales',
  insights: 'Insights',
  tensionPatternsLabel: 'Patrones de tension',
  costBreakdown: 'Desglose de costos',
  gen: 'Gen',
  concept: 'Concepto',
  perturbation: 'Perturbación',
  subtotal: 'Subtotal',
  total: 'TOTAL',
  noReportData: 'El reporte aparecera al finalizar el experimento.',
  evolvedLabel: '→ evolucionado',
  tensionLabel: 'Tension:',
  agentAReceived: 'Agent-A recibio:',
  agentBReceived: 'Agent-B recibio:',
  rationaleLabel: 'Racional:',
  critique: 'Critica',
  exportReport: 'Exportar Reporte',
  outcomeEntropy: 'Entropía de Outcomes',
  cosineDistance: 'Distancia Coseno',
  surpriseProxy: 'Índice de Sorpresa',
  wmChangeRate: 'Tasa de Cambio WM',
  wmSize: 'Tamaño World Model',
  entropicCoherenceNote: 'En modo entropico, coherencia mide caos (pico = máximo caos, colapso = insight)',

  logStarted: 'Experimento iniciado',
  logStopped: 'Experimento detenido por el usuario',
  logComplete: 'Experimento completo',
  logStopRequested: 'Detener solicitado...',
  logGenerating: (gen, round) => `Gen ${gen} Ronda ${round}: Agent-A generando concepto...`,
  logCritiquing: (gen, round, concept) => `Gen ${gen} Ronda ${round}: Agent-B criticando "${concept}"...`,
  logInteraction: (gen, round, concept, outcome, gain) =>
    `Gen ${gen} Ronda ${round}: "${concept}" → ${outcome} (ganancia: ${gain})`,
  logDistilling: (gen) => `Gen ${gen}: Destilando world models...`,
  logCoherence: (gen, coherence, cost) => `Gen ${gen}: coherencia=${coherence}, costo=$${cost}`,
  logPerturbing: (gen) => `Gen ${gen}: Agent-P perturbando world models...`,
  logPerturbApplied: (gen, cost) => `Gen ${gen}: perturbacion aplicada (costo: $${cost})`,
}

export const STRINGS: Record<Lang, Strings> = { en, es }

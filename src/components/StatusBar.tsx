import { ExperimentState } from '../types'
import { useLang } from '../i18n/context'

interface Props {
  state: ExperimentState
  maxGenerations: number
  maxRounds: number
}

const statusColor: Record<string, string> = {
  idle: '#6b7280',
  running: '#10b981',
  done: '#00e5cc',
  error: '#ef4444',
}

export function StatusBar({ state, maxGenerations, maxRounds }: Props) {
  const t = useLang()

  const pill = (label: string, value: string | number, color = '#a78bfa') => (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded"
      style={{ background: '#0e0e1c', border: '1px solid #1a1a2e' }}
    >
      <span className="text-xs" style={{ color: '#6b7280' }}>
        {label}
      </span>
      <span className="font-mono text-sm font-medium" style={{ color }}>
        {value}
      </span>
    </div>
  )

  const phaseDisplay = state.currentPhase === 'perturbing'
    ? t.phasePerturbing
    : state.currentPhase || '—'

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-6 py-3"
      style={{ background: '#09090f', borderBottom: '1px solid #1a1a2e' }}
    >
      {pill(t.status, state.status, statusColor[state.status])}
      {pill(t.generation, `${state.currentGeneration}/${maxGenerations}`, '#00e5cc')}
      {pill(t.round, `${state.currentRound}/${maxRounds}`, '#a78bfa')}
      {pill(t.phase, phaseDisplay, '#f59e0b')}
      {pill(t.coherence, `${(state.coherence * 100).toFixed(1)}%`, '#10b981')}
    </div>
  )
}

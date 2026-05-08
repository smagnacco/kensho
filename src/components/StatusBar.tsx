import { ExperimentState } from '../types'

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

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-6 py-3"
      style={{ background: '#09090f', borderBottom: '1px solid #1a1a2e' }}
    >
      {pill('estado', state.status, statusColor[state.status])}
      {pill('generación', `${state.currentGeneration}/${maxGenerations}`, '#00e5cc')}
      {pill('ronda', `${state.currentRound}/${maxRounds}`, '#a78bfa')}
      {pill(
        'fase',
        state.currentPhase === 'perturbing' ? 'Perturbando' : state.currentPhase || '—',
        '#f59e0b',
      )}
      {pill('coherencia', `${(state.coherence * 100).toFixed(1)}%`, '#10b981')}
    </div>
  )
}

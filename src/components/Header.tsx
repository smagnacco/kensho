import { ExperimentState } from '../types'

interface Props {
  state: ExperimentState
  onStart: () => void
  onStop: () => void
}

export function Header({ state, onStart, onStop }: Props) {
  const running = state.status === 'running'

  return (
    <header
      style={{ background: '#09090f', borderBottom: '1px solid #1a1a2e' }}
      className="flex items-center justify-between px-6 py-4"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: '#00e5cc' }}>
          Kenshō
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
          ver la propia naturaleza — adversarial evolutionary consciousness explorer
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-xs" style={{ color: '#6b7280' }}>
            costo total
          </div>
          <div className="font-mono text-lg font-medium" style={{ color: '#f59e0b' }}>
            ${state.totalCost.toFixed(4)}
          </div>
        </div>

        {running ? (
          <button
            onClick={onStop}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            Detener
          </button>
        ) : (
          <button
            onClick={onStart}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{
              background: state.status === 'running' ? '#1a1a2e' : '#00e5cc',
              color: '#09090f',
            }}
          >
            {state.status === 'done' ? 'Reiniciar' : 'Iniciar'}
          </button>
        )}
      </div>
    </header>
  )
}

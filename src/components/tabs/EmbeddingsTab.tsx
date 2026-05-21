import { EntropicGenMetrics } from '../../types'
import { useLang } from '../../i18n/context'

interface Props {
  entropicData: EntropicGenMetrics[]
}

export function EmbeddingsTab({ entropicData }: Props) {
  const t = useLang()

  if (entropicData.length === 0) {
    return (
      <div className="p-4">
        <div
          className="rounded p-6 text-sm text-center"
          style={{ background: '#0e0e1c', border: '1px solid #1a1a2e', color: '#4b5563' }}
        >
          Embedding metrics will appear when running an entropic experiment.
        </div>
      </div>
    )
  }

  // Collect all round metrics across generations
  const allRoundMetrics = entropicData.flatMap((e) => e.roundMetrics)

  return (
    <div className="p-4 space-y-8">
      {/* Cosine Distance Timeline */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>
          {t.surpriseProxy} (1 - {t.cosineDistance})
        </h2>
        <div className="relative h-64 rounded p-3" style={{ background: '#0e0e1c', border: '1px solid #1a1a2e' }}>
          <svg width="100%" height="100%" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#1a1a2e" strokeWidth="1" />

            {/* Line chart of surprise proxy */}
            <polyline
              points={allRoundMetrics
                .map((r, i) => {
                  const x = ((i + 1) / allRoundMetrics.length) * 100
                  const y = 100 - r.surpriseProxy * 100
                  return `${x}%,${y}%`
                })
                .join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />

            {/* Points */}
            {allRoundMetrics.map((r, i) => {
              const x = ((i + 1) / allRoundMetrics.length) * 100
              const y = 100 - r.surpriseProxy * 100
              return (
                <circle
                  key={i}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill="#f59e0b"
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>
        </div>
        <div className="flex gap-4 mt-2 text-xs" style={{ color: '#6b7280' }}>
          <span>Generations: {entropicData.length}</span>
          <span>Total rounds: {allRoundMetrics.length}</span>
          <span>Max surprise: {Math.max(...allRoundMetrics.map((r) => r.surpriseProxy)).toFixed(2)}</span>
        </div>
      </section>

      {/* Divergence from WM */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>
          Divergence from World Model
        </h2>
        <div className="space-y-3">
          {entropicData.map((gen) => (
            <div key={gen.generation} className="rounded p-3" style={{ background: '#0e0e1c', border: '1px solid #1a1a2e' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: '#e5e7eb' }}>
                  Generation {gen.generation}
                </span>
                <span className="text-xs" style={{ color: '#6b7280' }}>
                  {gen.roundMetrics.length} rounds
                </span>
              </div>
              <div className="space-y-1">
                {gen.roundMetrics.map((r) => (
                  <div key={r.round} className="flex items-center gap-2 text-xs">
                    <span className="w-12" style={{ color: '#6b7280' }}>R{r.round}:</span>
                    <div
                      className="flex-1 h-3 rounded"
                      style={{
                        background: `linear-gradient(90deg, #1a1a2e, rgba(167, 139, 250, ${r.divergenceFromWM}))`,
                      }}
                    />
                    <span style={{ color: '#a78bfa', minWidth: '40px', textAlign: 'right' }}>
                      {r.divergenceFromWM.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WM Size Evolution */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>
          {t.wmSize} Evolution
        </h2>
        <div className="space-y-4">
          {entropicData.map((e) => {
            const maxSize = Math.max(...entropicData.map((g) => Math.max(g.wmSizeA, g.wmSizeB)), 1)
            return (
              <div key={e.generation} className="flex items-center gap-3">
                <span className="font-mono text-xs w-12 shrink-0" style={{ color: '#6b7280' }}>
                  G{e.generation}
                </span>
                <div className="flex gap-1 flex-1">
                  <div className="flex-1 flex items-center gap-1">
                    <div
                      className="h-6 rounded"
                      style={{
                        width: `${(e.wmSizeA / maxSize) * 100}%`,
                        minWidth: '4px',
                        background: '#00e5cc',
                      }}
                    />
                    <span className="text-xs w-8 text-right" style={{ color: '#00e5cc' }}>
                      {e.wmSizeA}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <div
                      className="h-6 rounded"
                      style={{
                        width: `${(e.wmSizeB / maxSize) * 100}%`,
                        minWidth: '4px',
                        background: '#a78bfa',
                      }}
                    />
                    <span className="text-xs w-8 text-right" style={{ color: '#a78bfa' }}>
                      {e.wmSizeB}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

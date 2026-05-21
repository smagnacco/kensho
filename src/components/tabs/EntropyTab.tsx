import { EntropicGenMetrics } from '../../types'
import { useLang } from '../../i18n/context'

interface Props {
  entropicData: EntropicGenMetrics[]
}

export function EntropyTab({ entropicData }: Props) {
  const t = useLang()

  if (entropicData.length === 0) {
    return (
      <div className="p-4">
        <div
          className="rounded p-6 text-sm text-center"
          style={{ background: '#0e0e1c', border: '1px solid #1a1a2e', color: '#4b5563' }}
        >
          Entropy metrics will appear when running an entropic experiment.
        </div>
      </div>
    )
  }

  const maxEntropy = Math.max(...entropicData.map((e) => e.outcomeEntropy), 1)
  const maxDistance = Math.max(...entropicData.map((e) => e.avgCosineDistance), 1)

  return (
    <div className="p-4 space-y-8">
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>
          {t.outcomeEntropy}
        </h2>
        <div className="space-y-2">
          {entropicData.map((e) => (
            <div key={e.generation} className="flex items-center gap-3">
              <span className="font-mono text-xs w-8 shrink-0" style={{ color: '#6b7280' }}>
                G{e.generation}
              </span>
              <div className="flex-1 relative h-5 rounded overflow-hidden" style={{ background: '#1a1a2e' }}>
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{ width: `${(e.outcomeEntropy / maxEntropy) * 100}%`, background: '#f59e0b' }}
                />
              </div>
              <span className="font-mono text-xs w-12 shrink-0 text-right" style={{ color: '#f59e0b' }}>
                {e.outcomeEntropy.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>
          {t.cosineDistance}
        </h2>
        <div className="space-y-2">
          {entropicData.map((e) => (
            <div key={e.generation} className="flex items-center gap-3">
              <span className="font-mono text-xs w-8 shrink-0" style={{ color: '#6b7280' }}>
                G{e.generation}
              </span>
              <div className="flex-1 relative h-5 rounded overflow-hidden" style={{ background: '#1a1a2e' }}>
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{ width: `${(e.avgCosineDistance / maxDistance) * 100}%`, background: '#a78bfa' }}
                />
              </div>
              <span className="font-mono text-xs w-12 shrink-0 text-right" style={{ color: '#a78bfa' }}>
                {e.avgCosineDistance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>
          {t.wmChangeRate}
        </h2>
        <div className="rounded overflow-hidden" style={{ border: '1px solid #1a1a2e' }}>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr style={{ background: '#0e0e1c', borderBottom: '1px solid #1a1a2e' }}>
                <th className="text-left px-3 py-2" style={{ color: '#6b7280' }}>Gen</th>
                <th className="text-left px-3 py-2" style={{ color: '#6b7280' }}>Change Rate</th>
                <th className="text-left px-3 py-2" style={{ color: '#6b7280' }}>WM Size A</th>
                <th className="text-left px-3 py-2" style={{ color: '#6b7280' }}>WM Size B</th>
              </tr>
            </thead>
            <tbody>
              {entropicData.map((e, idx) => (
                <tr
                  key={e.generation}
                  style={{ background: idx % 2 === 0 ? '#09090f' : '#0e0e1c', borderBottom: '1px solid #1a1a2e' }}
                >
                  <td className="px-3 py-1.5" style={{ color: '#9ca3af' }}>G{e.generation}</td>
                  <td className="px-3 py-1.5" style={{ color: '#00e5cc' }}>{(e.wmChangeRate * 100).toFixed(1)}%</td>
                  <td className="px-3 py-1.5" style={{ color: '#a78bfa' }}>{e.wmSizeA}</td>
                  <td className="px-3 py-1.5" style={{ color: '#a78bfa' }}>{e.wmSizeB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

import { GenerationResult } from '../../types'
import { useLang } from '../../i18n/context'

interface Props {
  generations: GenerationResult[]
}

export function CoherenceTab({ generations }: Props) {
  const t = useLang()

  if (generations.length === 0) {
    return (
      <div className="p-4">
        <div
          className="rounded p-6 text-sm text-center"
          style={{ background: '#0e0e1c', border: '1px solid #1a1a2e', color: '#4b5563' }}
        >
          {t.noCoherenceData}
        </div>
      </div>
    )
  }

  const maxCoherence = Math.max(...generations.map((g) => g.coherence), 0.01)

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-3">
        <div className="text-xs font-semibold" style={{ color: '#6b7280' }}>
          {t.coherenceEvolution}
        </div>
        {generations.map((g) => (
          <div key={g.generation} className="space-y-1">
            <div className="flex justify-between text-xs font-mono" style={{ color: '#6b7280' }}>
              <span>{t.gen} {g.generation}</span>
              <span style={{ color: '#10b981' }}>{(g.coherence * 100).toFixed(1)}%</span>
            </div>
            <div className="relative h-4 rounded overflow-hidden" style={{ background: '#1a1a2e' }}>
              <div
                className="absolute left-0 top-0 h-full rounded transition-all"
                style={{
                  width: `${(g.coherence / maxCoherence) * 100}%`,
                  background: `linear-gradient(90deg, #00e5cc, #10b981)`,
                }}
              />
            </div>
            <div className="text-xs font-mono" style={{ color: '#4b5563' }}>
              {t.cost}: ${g.totalCost.toFixed(4)}
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded overflow-hidden"
        style={{ border: '1px solid #1a1a2e' }}
      >
        <table className="w-full text-xs font-mono">
          <thead>
            <tr style={{ background: '#0e0e1c', borderBottom: '1px solid #1a1a2e' }}>
              {[t.gen, t.rounds, t.accepted, t.evolved, t.rejected, t.coherence, t.cost].map((h) => (
                <th key={h} className="text-left px-3 py-2" style={{ color: '#6b7280' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {generations.map((g, i) => {
              const accepted = g.interactions.filter((x) => x.outcome === 'accepted').length
              const evolved = g.interactions.filter((x) => x.outcome === 'evolved').length
              const rejected = g.interactions.filter((x) => x.outcome === 'rejected').length
              return (
                <tr
                  key={g.generation}
                  style={{
                    background: i % 2 === 0 ? '#09090f' : '#0e0e1c',
                    borderBottom: '1px solid #1a1a2e',
                  }}
                >
                  <td className="px-3 py-2" style={{ color: '#e5e7eb' }}>{g.generation}</td>
                  <td className="px-3 py-2" style={{ color: '#9ca3af' }}>{g.interactions.length}</td>
                  <td className="px-3 py-2" style={{ color: '#10b981' }}>{accepted}</td>
                  <td className="px-3 py-2" style={{ color: '#a78bfa' }}>{evolved}</td>
                  <td className="px-3 py-2" style={{ color: '#ef4444' }}>{rejected}</td>
                  <td className="px-3 py-2" style={{ color: '#10b981' }}>{(g.coherence * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2" style={{ color: '#f59e0b' }}>${g.totalCost.toFixed(4)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

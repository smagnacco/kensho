import { GenerationResult, ExperimentConfig, PerturbationRecord } from '../../types'
import { useLang } from '../../i18n/context'
import { downloadReport } from '../../utils/exportReport'

interface Props {
  generations: GenerationResult[]
  perturbations: PerturbationRecord[]
  config: ExperimentConfig
}

function Card({ label, value, color = '#e5e7eb' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded p-3 text-center" style={{ background: '#0e0e1c', border: '1px solid #1a1a2e' }}>
      <div className="text-xs mb-1" style={{ color: '#6b7280' }}>
        {label}
      </div>
      <div className="font-mono text-lg font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

export function ReportTab({ generations, perturbations, config }: Props) {
  const t = useLang()

  if (generations.length === 0) {
    return (
      <div className="p-4">
        <div
          className="rounded p-6 text-sm text-center"
          style={{ background: '#0e0e1c', border: '1px solid #1a1a2e', color: '#4b5563' }}
        >
          {t.noReportData}
        </div>
      </div>
    )
  }

  const allInteractions = generations.flatMap((g) => g.interactions)
  const emerged = allInteractions.filter((i) => i.outcome === 'evolved')
  const accepted = allInteractions.filter((i) => i.outcome === 'accepted')
  const perturbCost = perturbations.reduce((s, p) => s + p.cost, 0)
  const totalCost = generations.reduce((s, g) => s + g.totalCost, 0) + perturbCost
  const lastA = generations[generations.length - 1].worldModelA
  const lastB = generations[generations.length - 1].worldModelB

  return (
    <div className="p-4 space-y-8">
      {/* Export Button */}
      <div className="flex gap-2">
        <button
          onClick={() => downloadReport(generations, perturbations, config, 'kensho-report')}
          className="px-4 py-2 text-sm font-medium rounded text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {t.exportReport || 'Export Report'}
        </button>
      </div>

      {/* 1. Summary */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>{t.summary}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card label={t.modelA} value={config.agentA.model} color="#00e5cc" />
          <Card label={t.modelB} value={config.agentB.model} color="#a78bfa" />
          <Card label={t.modelP} value={config.agentP.model} color="#f59e0b" />
          <Card label={t.generation} value={generations.length} />
          <Card label={t.totalInteractions} value={allInteractions.length} />
          <Card label={t.emerged} value={emerged.length} color="#a78bfa" />
          <Card label={t.totalCost} value={`$${totalCost.toFixed(4)}`} color="#f59e0b" />
        </div>
      </section>

      {/* 2. Coherence evolution */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>{t.coherenceEvolution}</h2>
        <div className="space-y-2">
          {generations.map((g) => (
            <div key={g.generation} className="flex items-center gap-3">
              <span className="font-mono text-xs w-8 shrink-0" style={{ color: '#6b7280' }}>
                G{g.generation}
              </span>
              <div className="flex-1 relative h-5 rounded overflow-hidden" style={{ background: '#1a1a2e' }}>
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{ width: `${g.coherence * 100}%`, background: `linear-gradient(90deg, #00e5cc, #10b981)` }}
                />
              </div>
              <span className="font-mono text-xs w-12 shrink-0 text-right" style={{ color: '#10b981' }}>
                {(g.coherence * 100).toFixed(1)}%
              </span>
              <span className="font-mono text-xs w-20 shrink-0 text-right" style={{ color: '#f59e0b' }}>
                ${g.totalCost.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Emerged concepts */}
      {emerged.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>{t.emergedConcepts}</h2>
          <div className="space-y-3">
            {emerged.map((i, idx) => (
              <div key={idx} className="rounded p-3" style={{ background: '#0e0e1c', border: '1px solid #a78bfa44' }}>
                <div className="font-mono text-sm font-medium mb-1" style={{ color: '#a78bfa' }}>
                  {i.concept}
                  <span className="ml-2 text-xs" style={{ color: '#6b7280' }}>{t.evolvedLabel}</span>
                </div>
                <p className="text-xs leading-relaxed mb-1" style={{ color: '#9ca3af' }}>{i.definition}</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>{t.tensionLabel} {i.tensionInsight}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3b. Perturbations */}
      {perturbations.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>{t.perturbationsBetweenGenerations}</h2>
          <div className="space-y-3">
            {perturbations.map((p, idx) => (
              <div key={idx} className="rounded p-3 space-y-2" style={{ background: '#0e0e1c', border: '1px solid #f59e0b55' }}>
                <div className="text-xs font-semibold font-mono" style={{ color: '#f59e0b' }}>
                  G{p.afterGeneration} → G{p.afterGeneration + 1}
                </div>
                <div className="text-xs space-y-1">
                  <div>
                    <span style={{ color: '#00e5cc' }}>{t.agentAReceived} </span>
                    <span style={{ color: '#9ca3af' }}>{p.perturbationA}</span>
                  </div>
                  <div>
                    <span style={{ color: '#a78bfa' }}>{t.agentBReceived} </span>
                    <span style={{ color: '#9ca3af' }}>{p.perturbationB}</span>
                  </div>
                </div>
                <p className="text-xs" style={{ color: '#6b7280' }}>{t.rationaleLabel} {p.rationale}</p>
                <div className="text-xs font-mono text-right" style={{ color: '#4b5563' }}>
                  {t.cost}: ${p.cost.toFixed(5)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Accepted concepts */}
      {accepted.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>{t.acceptedConcepts}</h2>
          <div className="space-y-2">
            {accepted.map((i, idx) => (
              <div key={idx} className="rounded p-3" style={{ background: '#0e0e1c', border: '1px solid #10b98144' }}>
                <div className="font-mono text-sm font-medium mb-1" style={{ color: '#10b981' }}>{i.concept}</div>
                <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{i.definition}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Final world models */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>{t.finalWorldModels}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { label: t.agentAGenerator, color: '#00e5cc', wm: lastA },
            { label: t.agentBCritic, color: '#a78bfa', wm: lastB },
          ].map(({ label, color, wm }) => (
            <div key={label} className="rounded p-4 space-y-3" style={{ background: '#0e0e1c', border: `1px solid ${color}44` }}>
              <div className="text-sm font-semibold" style={{ color }}>{label}</div>
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.insights}</div>
                <ul className="space-y-0.5">
                  {wm.confirmedInsights.map((s, i) => (
                    <li key={i} className="text-xs" style={{ color: '#9ca3af' }}>&rsaquo; {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.tensionPatternsLabel}</div>
                <ul className="space-y-0.5">
                  {wm.tensionPatterns.map((s, i) => (
                    <li key={i} className="text-xs" style={{ color: '#9ca3af' }}>&rsaquo; {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Cost breakdown */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#e5e7eb' }}>{t.costBreakdown}</h2>
        <div className="rounded overflow-hidden" style={{ border: '1px solid #1a1a2e' }}>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr style={{ background: '#0e0e1c', borderBottom: '1px solid #1a1a2e' }}>
                {[t.gen, t.round, t.concept, t.generation, t.critique, t.perturbation, t.subtotal].map((h) => (
                  <th key={h} className="text-left px-3 py-2" style={{ color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {generations.map((g) => {
                const perturbCostGen = g.perturbation?.cost ?? 0
                return g.interactions.map((i, idx) => {
                  const isFirstOfGen = idx === 0
                  const subtotal = i.stageCosts.generation + i.stageCosts.critique + (isFirstOfGen ? perturbCostGen : 0)
                  const rowIdx = allInteractions.indexOf(i)
                  return (
                    <tr
                      key={`${g.generation}-${i.round}`}
                      style={{ background: rowIdx % 2 === 0 ? '#09090f' : '#0e0e1c', borderBottom: '1px solid #1a1a2e' }}
                    >
                      <td className="px-3 py-1.5" style={{ color: '#9ca3af' }}>{i.generation}</td>
                      <td className="px-3 py-1.5" style={{ color: '#9ca3af' }}>{i.round}</td>
                      <td className="px-3 py-1.5 max-w-[140px] truncate" style={{ color: '#e5e7eb' }}>{i.concept}</td>
                      <td className="px-3 py-1.5" style={{ color: '#f59e0b' }}>${i.stageCosts.generation.toFixed(5)}</td>
                      <td className="px-3 py-1.5" style={{ color: '#f59e0b' }}>${i.stageCosts.critique.toFixed(5)}</td>
                      <td className="px-3 py-1.5" style={{ color: isFirstOfGen && perturbCostGen > 0 ? '#f59e0b' : '#374151' }}>
                        {isFirstOfGen && perturbCostGen > 0 ? `$${perturbCostGen.toFixed(5)}` : '—'}
                      </td>
                      <td className="px-3 py-1.5" style={{ color: '#f59e0b' }}>${subtotal.toFixed(5)}</td>
                    </tr>
                  )
                })
              })}
              <tr style={{ background: '#0e0e1c', borderTop: '2px solid #1a1a2e' }}>
                <td colSpan={6} className="px-3 py-2 font-semibold" style={{ color: '#e5e7eb' }}>{t.total}</td>
                <td className="px-3 py-2 font-semibold" style={{ color: '#f59e0b' }}>${totalCost.toFixed(5)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

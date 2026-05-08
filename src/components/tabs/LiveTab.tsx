import { TensionRecord, LogEntry, PerturbationRecord } from '../../types'
import { useLang } from '../../i18n/context'

const outcomeColor: Record<string, string> = {
  accepted: '#10b981',
  rejected: '#ef4444',
  evolved: '#a78bfa',
}

function InteractionCard({ record }: { record: TensionRecord }) {
  const t = useLang()
  const color = outcomeColor[record.outcome]
  return (
    <div
      className="rounded p-3 space-y-2"
      style={{ background: '#0e0e1c', border: `1px solid ${color}44` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs" style={{ color: '#6b7280' }}>
            G{record.generation} R{record.round}
          </span>
          <div className="font-mono text-sm font-medium mt-0.5" style={{ color: '#00e5cc' }}>
            {record.concept}
          </div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded font-mono shrink-0 mt-1"
          style={{ background: `${color}22`, color }}
        >
          {record.outcome}
        </span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
        {record.definition}
      </p>
      <p className="text-xs" style={{ color: '#6b7280' }}>
        {t.tension}: {record.tensionInsight}
      </p>
      <div className="flex gap-4 text-xs font-mono" style={{ color: '#4b5563' }}>
        <span>{t.gain}: {record.informationGain.toFixed(2)}</span>
        <span>
          {t.cost}: ${(record.stageCosts.generation + record.stageCosts.critique).toFixed(4)}
        </span>
      </div>
    </div>
  )
}

function PerturbationCard({ record }: { record: PerturbationRecord }) {
  const t = useLang()
  return (
    <div
      className="rounded p-3 space-y-2"
      style={{ background: '#0e0e1c', border: '1px solid #f59e0b55' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold font-mono" style={{ color: '#f59e0b' }}>
          {t.perturbationHeader} · G{record.afterGeneration} → G{record.afterGeneration + 1}
        </span>
        <span className="text-xs font-mono" style={{ color: '#4b5563' }}>
          Agent-P
        </span>
      </div>
      <div className="text-xs space-y-1">
        <div>
          <span style={{ color: '#00e5cc' }}>{t.perturbationAgentA} </span>
          <span style={{ color: '#9ca3af' }}>{record.perturbationA}</span>
        </div>
        <div>
          <span style={{ color: '#a78bfa' }}>{t.perturbationAgentB} </span>
          <span style={{ color: '#9ca3af' }}>{record.perturbationB}</span>
        </div>
      </div>
      <p className="text-xs" style={{ color: '#6b7280' }}>
        {t.rationale}: {record.rationale}
      </p>
      <div className="text-xs font-mono text-right" style={{ color: '#4b5563' }}>
        ${record.cost.toFixed(5)}
      </div>
    </div>
  )
}

function LogPanel({ entries }: { entries: LogEntry[] }) {
  const t = useLang()
  const levelColor: Record<string, string> = {
    info: '#6b7280',
    warn: '#f59e0b',
    error: '#ef4444',
  }

  return (
    <div
      className="rounded flex flex-col"
      style={{ background: '#0e0e1c', border: '1px solid #1a1a2e', minHeight: 200 }}
    >
      <div className="px-3 py-2 text-xs font-semibold" style={{ color: '#6b7280', borderBottom: '1px solid #1a1a2e' }}>
        {t.systemLog}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs" style={{ maxHeight: 400 }}>
        {entries.length === 0 && (
          <div style={{ color: '#374151' }}>{t.waiting}</div>
        )}
        {entries.map((e, i) => (
          <div key={i} className="flex gap-2">
            <span style={{ color: '#374151' }}>{e.timestamp}</span>
            <span style={{ color: levelColor[e.level] }}>{e.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  interactions: TensionRecord[]
  perturbations: PerturbationRecord[]
  log: LogEntry[]
}

export function LiveTab({ interactions, perturbations, log }: Props) {
  const t = useLang()

  type Item =
    | { kind: 'interaction'; record: TensionRecord }
    | { kind: 'perturbation'; record: PerturbationRecord }

  const byGen = new Map<number, TensionRecord[]>()
  for (const r of interactions) {
    if (!byGen.has(r.generation)) byGen.set(r.generation, [])
    byGen.get(r.generation)!.push(r)
  }

  const perturbByGen = new Map(perturbations.map((p) => [p.afterGeneration, p]))
  const gens = [...byGen.keys()].sort((a, b) => b - a)

  const items: Item[] = []
  for (const gen of gens) {
    const perturb = perturbByGen.get(gen)
    if (perturb) items.push({ kind: 'perturbation', record: perturb })
    for (const r of [...(byGen.get(gen) ?? [])].reverse()) {
      items.push({ kind: 'interaction', record: r })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      <div>
        <div className="text-xs font-semibold mb-3" style={{ color: '#6b7280' }}>
          {t.interactions} ({interactions.length})
        </div>
        <div className="space-y-3">
          {items.length === 0 && (
            <div
              className="rounded p-4 text-xs"
              style={{ background: '#0e0e1c', border: '1px solid #1a1a2e', color: '#374151' }}
            >
              {t.waitingForExperiment}
            </div>
          )}
          {items.map((item, i) =>
            item.kind === 'perturbation' ? (
              <PerturbationCard key={`perturb-${item.record.afterGeneration}`} record={item.record} />
            ) : (
              <InteractionCard
                key={`${item.record.generation}-${item.record.round}-${i}`}
                record={item.record}
              />
            ),
          )}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold mb-3" style={{ color: '#6b7280' }}>
          {t.systemLog}
        </div>
        <LogPanel entries={log} />
      </div>
    </div>
  )
}

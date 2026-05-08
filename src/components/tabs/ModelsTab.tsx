import { WorldModel } from '../../types'
import { useLang } from '../../i18n/context'

function WorldModelPanel({
  label,
  color,
  wm,
}: {
  label: string
  color: string
  wm: WorldModel
}) {
  const t = useLang()

  const section = (title: string, items: string[]) => (
    <div className="space-y-1">
      <div className="text-xs font-semibold" style={{ color: '#6b7280' }}>
        {title}
      </div>
      {items.length === 0 ? (
        <div className="text-xs" style={{ color: '#374151' }}>
          {t.noneYet}
        </div>
      ) : (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-xs leading-relaxed flex gap-2" style={{ color: '#9ca3af' }}>
              <span style={{ color }}>&rsaquo;</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <div
      className="rounded p-4 space-y-4"
      style={{ background: '#0e0e1c', border: `1px solid ${color}44` }}
    >
      <div className="text-sm font-semibold" style={{ color }}>
        {label}
      </div>
      {section(t.confirmedInsights, wm.confirmedInsights)}
      {section(t.rejectedPaths, wm.rejectedPaths)}
      {section(t.tensionPatterns, wm.tensionPatterns)}
      <div className="space-y-1">
        <div className="text-xs font-semibold" style={{ color: '#6b7280' }}>
          {t.theoryOfOther}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
          {wm.theoryOfOther}
        </p>
      </div>
    </div>
  )
}

interface Props {
  worldModelA: WorldModel
  worldModelB: WorldModel
}

export function ModelsTab({ worldModelA, worldModelB }: Props) {
  const t = useLang()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      <WorldModelPanel label={t.agentAGenerator} color="#00e5cc" wm={worldModelA} />
      <WorldModelPanel label={t.agentBCritic} color="#a78bfa" wm={worldModelB} />
    </div>
  )
}

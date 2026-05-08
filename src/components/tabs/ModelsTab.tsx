import { WorldModel } from '../../types'

function WorldModelPanel({
  label,
  color,
  wm,
}: {
  label: string
  color: string
  wm: WorldModel
}) {
  const section = (title: string, items: string[]) => (
    <div className="space-y-1">
      <div className="text-xs font-semibold" style={{ color: '#6b7280' }}>
        {title}
      </div>
      {items.length === 0 ? (
        <div className="text-xs" style={{ color: '#374151' }}>
          (ninguno aun)
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
      {section('Insights confirmados', wm.confirmedInsights)}
      {section('Caminos rechazados', wm.rejectedPaths)}
      {section('Patrones de tension', wm.tensionPatterns)}
      <div className="space-y-1">
        <div className="text-xs font-semibold" style={{ color: '#6b7280' }}>
          Teoria del otro
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      <WorldModelPanel label="Agent-A (Generador)" color="#00e5cc" wm={worldModelA} />
      <WorldModelPanel label="Agent-B (Critico)" color="#a78bfa" wm={worldModelB} />
    </div>
  )
}

import { useState } from 'react'
import { useExperiment } from './hooks/useExperiment'
import { Header } from './components/Header'
import { StatusBar } from './components/StatusBar'
import { ConfigPanel } from './components/ConfigPanel'
import { LiveTab } from './components/tabs/LiveTab'
import { ModelsTab } from './components/tabs/ModelsTab'
import { CoherenceTab } from './components/tabs/CoherenceTab'
import { ReportTab } from './components/tabs/ReportTab'

type TabId = 'live' | 'models' | 'coherence' | 'report'

const TABS: { id: TabId; label: string }[] = [
  { id: 'live', label: 'En vivo' },
  { id: 'models', label: 'World Models' },
  { id: 'coherence', label: 'Coherencia' },
  { id: 'report', label: 'Reporte' },
]

export default function App() {
  const [tab, setTab] = useState<TabId>('live')
  const { config, setConfig, state, start, stop } = useExperiment()

  const allInteractions = [
    ...state.generations.flatMap((g) => g.interactions),
    ...state.currentInteractions,
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#09090f', color: '#e5e7eb' }}>
      <Header state={state} onStart={start} onStop={stop} />
      <StatusBar state={state} maxGenerations={config.generations} maxRounds={config.rounds} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="w-72 shrink-0 overflow-y-auto p-4 space-y-4"
          style={{ borderRight: '1px solid #1a1a2e' }}
        >
          <ConfigPanel
            config={config}
            onChange={setConfig}
            disabled={state.status === 'running'}
          />
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div
            className="flex border-b shrink-0"
            style={{ borderColor: '#1a1a2e', background: '#09090f' }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-5 py-3 text-sm transition-colors relative"
                style={{
                  color: tab === t.id ? '#00e5cc' : '#6b7280',
                  borderBottom: tab === t.id ? '2px solid #00e5cc' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'live' && (
              <LiveTab
                interactions={allInteractions}
                perturbations={state.perturbations}
                log={state.log}
              />
            )}
            {tab === 'models' && (
              <ModelsTab worldModelA={state.worldModelA} worldModelB={state.worldModelB} />
            )}
            {tab === 'coherence' && <CoherenceTab generations={state.generations} />}
            {tab === 'report' && (
              <ReportTab
                generations={state.generations}
                perturbations={state.perturbations}
                config={config}
              />
            )}
          </div>
        </main>
      </div>

      {state.error && (
        <div
          className="fixed bottom-4 right-4 rounded p-3 max-w-sm text-sm font-mono"
          style={{ background: '#1a0a0a', border: '1px solid #ef4444', color: '#ef4444' }}
        >
          {state.error}
        </div>
      )}
    </div>
  )
}

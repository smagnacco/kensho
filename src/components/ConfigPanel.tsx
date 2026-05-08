import { ExperimentConfig, Provider, ModelId } from '../types'
import { MODEL_CATALOG, defaultModelForProvider, apiKeyEnvVar } from '../config/models'
import { useLang } from '../i18n/context'
import { Lang, STRINGS } from '../i18n'

interface Props {
  config: ExperimentConfig
  onChange: (c: ExperimentConfig) => void
  disabled: boolean
}

function AgentConfig({
  label,
  color,
  note,
  provider,
  model,
  apiKey,
  onProviderChange,
  onModelChange,
  onKeyChange,
  disabled,
}: {
  label: string
  color: string
  note?: string
  provider: Provider
  model: ModelId
  apiKey: string
  onProviderChange: (p: Provider) => void
  onModelChange: (m: ModelId) => void
  onKeyChange: (k: string) => void
  disabled: boolean
}) {
  const t = useLang()
  const models = MODEL_CATALOG[provider]
  const safeModel = models.find((m) => m.id === model) ? model : models[0].id

  return (
    <div
      className="rounded p-4 space-y-3"
      style={{ background: '#0e0e1c', border: `1px solid ${color}33` }}
    >
      <div className="text-sm font-semibold" style={{ color }}>
        {label}
      </div>

      <label className="block">
        <span className="text-xs block mb-1" style={{ color: '#6b7280' }}>
          {t.provider}
        </span>
        <select
          value={provider}
          disabled={disabled}
          onChange={(e) => onProviderChange(e.target.value as Provider)}
          className="w-full rounded px-2 py-1.5 text-sm font-mono"
          style={{ background: '#09090f', color: '#e5e7eb', border: '1px solid #1a1a2e' }}
        >
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
          <option value="grok">Grok (xAI)</option>
        </select>
      </label>

      <label className="block">
        <span className="text-xs block mb-1" style={{ color: '#6b7280' }}>
          {t.model}
        </span>
        <select
          value={safeModel}
          disabled={disabled}
          onChange={(e) => onModelChange(e.target.value as ModelId)}
          className="w-full rounded px-2 py-1.5 text-sm font-mono"
          style={{ background: '#09090f', color: '#e5e7eb', border: '1px solid #1a1a2e' }}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs block mb-1" style={{ color: '#6b7280' }}>
          {t.apiKey}
        </span>
        <input
          type="password"
          value={apiKey}
          disabled={disabled}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder="sk-..."
          className="w-full rounded px-2 py-1.5 text-sm font-mono"
          style={{ background: '#09090f', color: '#e5e7eb', border: '1px solid #1a1a2e' }}
        />
      </label>

      {note && (
        <p className="text-xs" style={{ color: '#4b5563' }}>
          {note}
        </p>
      )}
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  disabled: boolean
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: '#6b7280' }}>
          {label}
        </span>
        <span className="text-xs font-mono" style={{ color: '#00e5cc' }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: '#00e5cc' }}
      />
      <div className="flex justify-between">
        <span className="text-xs" style={{ color: '#374151' }}>
          {min}
        </span>
        <span className="text-xs" style={{ color: '#374151' }}>
          {max}
        </span>
      </div>
    </div>
  )
}

export function ConfigPanel({ config, onChange, disabled }: Props) {
  const t = useLang()

  const setA = (patch: Partial<typeof config.agentA>) =>
    onChange({ ...config, agentA: { ...config.agentA, ...patch } })
  const setB = (patch: Partial<typeof config.agentB>) =>
    onChange({ ...config, agentB: { ...config.agentB, ...patch } })
  const setP = (patch: Partial<typeof config.agentP>) =>
    onChange({ ...config, agentP: { ...config.agentP, ...patch } })

  const handleProviderChange = (
    set: (patch: Partial<typeof config.agentA>) => void,
    p: Provider,
  ) => {
    set({ provider: p, model: defaultModelForProvider(p), apiKey: apiKeyEnvVar(p) })
  }

  return (
    <div
      className="rounded p-4 space-y-4"
      style={{ background: '#0e0e1c', border: '1px solid #1a1a2e' }}
    >
      <div className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>
        {t.configuration}
      </div>

      <div>
        <span className="text-xs block mb-1" style={{ color: '#6b7280' }}>
          {t.language}
        </span>
        <select
          value={config.lang}
          disabled={disabled}
          onChange={(e) => onChange({ ...config, lang: e.target.value as Lang })}
          className="w-full rounded px-2 py-1.5 text-sm font-mono"
          style={{ background: '#09090f', color: '#e5e7eb', border: '1px solid #1a1a2e' }}
        >
          {(Object.keys(STRINGS) as Lang[]).map((l) => (
            <option key={l} value={l}>
              {l === 'en' ? 'English' : 'Español'}
            </option>
          ))}
        </select>
      </div>

      <Slider
        label={t.generations}
        value={config.generations}
        min={2}
        max={8}
        onChange={(v) => onChange({ ...config, generations: v })}
        disabled={disabled}
      />
      <Slider
        label={t.roundsPerGeneration}
        value={config.rounds}
        min={2}
        max={10}
        onChange={(v) => onChange({ ...config, rounds: v })}
        disabled={disabled}
      />

      <div className="grid grid-cols-1 gap-4 pt-1">
        <AgentConfig
          label={t.agentA}
          color="#00e5cc"
          provider={config.agentA.provider}
          model={config.agentA.model}
          apiKey={config.agentA.apiKey}
          onProviderChange={(p) => handleProviderChange(setA, p)}
          onModelChange={(m) => setA({ model: m })}
          onKeyChange={(k) => setA({ apiKey: k })}
          disabled={disabled}
        />
        <AgentConfig
          label={t.agentB}
          color="#a78bfa"
          provider={config.agentB.provider}
          model={config.agentB.model}
          apiKey={config.agentB.apiKey}
          onProviderChange={(p) => handleProviderChange(setB, p)}
          onModelChange={(m) => setB({ model: m })}
          onKeyChange={(k) => setB({ apiKey: k })}
          disabled={disabled}
        />
        <AgentConfig
          label={t.agentP}
          color="#f59e0b"
          note={t.agentPNote}
          provider={config.agentP.provider}
          model={config.agentP.model}
          apiKey={config.agentP.apiKey}
          onProviderChange={(p) => handleProviderChange(setP, p)}
          onModelChange={(m) => setP({ model: m })}
          onKeyChange={(k) => setP({ apiKey: k })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

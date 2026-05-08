import { Provider, ModelId } from '../types'

export interface ModelEntry {
  id: ModelId
  label: string
}

export const MODEL_CATALOG: Record<Provider, ModelEntry[]> = {
  anthropic: [
    { id: 'claude-opus-4-5', label: 'Claude Opus 4.5' },
    { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
  ],
  openai: [
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { id: 'o3-mini', label: 'o3 Mini' },
  ],
  grok: [
    { id: 'grok-3', label: 'Grok 3' },
    { id: 'grok-3-mini', label: 'Grok 3 Mini' },
    { id: 'grok-2-vision', label: 'Grok 2 Vision' },
  ],
}

export function defaultModelForProvider(provider: Provider): ModelId {
  return MODEL_CATALOG[provider][0].id
}

export function apiKeyEnvVar(provider: Provider): string {
  if (provider === 'anthropic') return import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''
  if (provider === 'openai') return import.meta.env.VITE_OPENAI_API_KEY ?? ''
  return import.meta.env.VITE_GROK_API_KEY ?? ''
}

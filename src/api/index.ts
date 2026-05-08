import { Provider, ModelId } from '../types'
import { callAnthropic } from './anthropic'
import { callOpenAI } from './openai'
import { callGrok } from './grok'

export async function call(
  provider: Provider,
  system: string,
  user: string,
  model: ModelId,
  apiKey: string,
): Promise<{ parsed: unknown; cost: number }> {
  if (provider === 'anthropic') return callAnthropic(system, user, model, apiKey)
  if (provider === 'grok') return callGrok(system, user, model, apiKey)
  return callOpenAI(system, user, model, apiKey)
}

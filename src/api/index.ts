import { Provider, ModelId } from '../types'
import { callAnthropic } from './anthropic'
import { callOpenAI } from './openai'
import { callGrok } from './grok'
import { callGemini } from './gemini'

export async function call(
  provider: Provider,
  system: string,
  user: string,
  model: ModelId,
  apiKey: string,
  maxTokens = 1800,
): Promise<{ parsed: unknown; cost: number }> {
  if (provider === 'anthropic') return callAnthropic(system, user, model, apiKey, maxTokens)
  if (provider === 'grok') return callGrok(system, user, model, apiKey, maxTokens)
  if (provider === 'gemini') return callGemini(system, user, model, apiKey, maxTokens)
  return callOpenAI(system, user, model, apiKey, maxTokens)
}

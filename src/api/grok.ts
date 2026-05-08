import { ModelId } from '../types'
import { calcCost, parseJson } from './anthropic'

export async function callGrok(
  system: string,
  user: string,
  model: ModelId,
  apiKey: string,
): Promise<{ parsed: unknown; cost: number }> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Grok API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text: string = data.choices?.[0]?.message?.content ?? ''
  const inputTokens: number = data.usage?.prompt_tokens ?? 0
  const outputTokens: number = data.usage?.completion_tokens ?? 0
  const cost = calcCost(model, inputTokens, outputTokens)

  return { parsed: parseJson(text), cost }
}

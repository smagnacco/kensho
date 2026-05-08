import { ModelId } from '../types'
import { calcCost } from './anthropic'

function parseJson(raw: string): unknown {
  const stripped = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('No JSON object found in response')
  }
}

export async function callOpenAI(
  system: string,
  user: string,
  model: ModelId,
  apiKey: string,
): Promise<{ parsed: unknown; cost: number }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 900,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text: string = data.choices?.[0]?.message?.content ?? ''
  const inputTokens: number = data.usage?.prompt_tokens ?? 0
  const outputTokens: number = data.usage?.completion_tokens ?? 0
  const cost = calcCost(model, inputTokens, outputTokens)

  return { parsed: parseJson(text), cost }
}

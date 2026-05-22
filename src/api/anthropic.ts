import { ModelId } from '../types'

const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'claude-opus-4-7':       { input: 0.000003,  output: 0.000015 },
  'claude-opus-4-7-adaptive': { input: 0.000006, output: 0.000030 },
  'claude-sonnet-4-6':     { input: 0.000003,  output: 0.000015 },
  'claude-sonnet-4-6-adaptive': { input: 0.000006, output: 0.000030 },
  'claude-opus-4-5':       { input: 0.000015,  output: 0.000075 },
  'claude-sonnet-4-5':     { input: 0.000003,  output: 0.000015 },
  'claude-haiku-4-5':      { input: 0.0000008, output: 0.000004 },
  'gpt-4o':                { input: 0.0000025, output: 0.00001 },
  'gpt-4o-mini':           { input: 0.00000015, output: 0.0000006 },
  'o3-mini':               { input: 0.0000011,  output: 0.0000044 },
  'grok-3':                { input: 0.000003,   output: 0.000015 },
  'grok-3-mini':           { input: 0.0000003,  output: 0.0000005 },
  'grok-2-vision':         { input: 0.000002,   output: 0.000010 },
}

export function calcCost(model: ModelId, inputTokens: number, outputTokens: number): number {
  const rates = TOKEN_COSTS[model] ?? { input: 0, output: 0 }
  return inputTokens * rates.input + outputTokens * rates.output
}

export interface ApiResult {
  text: string
  cost: number
}

export function parseJson(raw: string): unknown {
  // Strip all markdown code fences anywhere in the string
  const stripped = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // Try direct parse first
  try {
    return JSON.parse(stripped)
  } catch {
    // Extract the first {...} block — handles leading/trailing prose
    const match = stripped.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        // JSON is likely truncated (hit max_tokens mid-object)
        throw new Error(
          `Response JSON is malformed or truncated. Raw (first 500 chars): ${raw.slice(0, 500)}`,
        )
      }
    }
    throw new Error(
      `No JSON object found in response. Raw (first 500 chars): ${raw.slice(0, 500)}`,
    )
  }
}

export async function callAnthropic(
  system: string,
  user: string,
  model: ModelId,
  apiKey: string,
  maxTokens = 1800,
): Promise<{ parsed: unknown; cost: number }> {
  const res = await fetch('/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text: string = data.content?.[0]?.text ?? ''
  const inputTokens: number = data.usage?.input_tokens ?? 0
  const outputTokens: number = data.usage?.output_tokens ?? 0
  const cost = calcCost(model, inputTokens, outputTokens)

  return { parsed: parseJson(text), cost }
}

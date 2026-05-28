import { ModelId } from '../types'
import { calcCost, parseJson } from './anthropic'

export async function callGemini(
  system: string,
  user: string,
  model: ModelId,
  apiKey: string,
  maxTokens = 1800,
): Promise<{ parsed: unknown; cost: number }> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: {
          text: system,
        },
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: user,
            },
          ],
        },
      ],
      generation_config: {
        max_output_tokens: maxTokens,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const inputTokens: number = data.usage_metadata?.prompt_token_count ?? 0
  const outputTokens: number = data.usage_metadata?.candidates_token_count ?? 0
  const cost = calcCost(model, inputTokens, outputTokens)

  return { parsed: parseJson(text), cost }
}

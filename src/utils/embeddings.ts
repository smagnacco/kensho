import { ExperimentConfig } from '../types'

export function cosineSim(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return Math.max(0, Math.min(1, sum))
}

export async function embed(text: string, config: ExperimentConfig): Promise<number[]> {
  const openaiAgent = config.agentA.provider === 'openai' ? config.agentA : config.agentB
  if (openaiAgent.provider !== 'openai') {
    throw new Error('Entropic mode requires an OpenAI agent to be configured with API key')
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiAgent.apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`OpenAI embedding failed: ${err.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

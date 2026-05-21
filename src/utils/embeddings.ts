import { ExperimentConfig } from '../types'

let transformersPipeline: any = null

async function initTransformers() {
  if (transformersPipeline) return transformersPipeline
  const { pipeline } = await import('@xenova/transformers')
  transformersPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  })
  return transformersPipeline
}

export function cosineSim(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return Math.max(0, Math.min(1, sum))
}

async function embedWithTransformers(text: string): Promise<number[]> {
  const pipeline = await initTransformers()
  const result = await pipeline(text, { pooling: 'mean', normalize: true })
  return Array.from(result.data)
}

async function embedWithOpenAI(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
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

export async function embed(text: string, config: ExperimentConfig): Promise<number[]> {
  if (config.embeddingBackend === 'openai-api') {
    const openaiAgent = config.agentA.provider === 'openai' ? config.agentA : config.agentB
    if (openaiAgent.provider !== 'openai') {
      throw new Error('OpenAI embedding backend requires an OpenAI agent to be configured with API key')
    }
    return embedWithOpenAI(text, openaiAgent.apiKey)
  } else {
    return embedWithTransformers(text)
  }
}

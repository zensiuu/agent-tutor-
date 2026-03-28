/**
 * Brain Module
 * Handles LLM inference via HuggingFace Inference API
 * Supports multiple models with automatic fallback
 */

export interface BrainConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface BrainResponse {
  response: string
  model: string
  error?: string
}

const MODELS = [
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
  'Qwen/Qwen2.5-7B-Instruct',
  'Qwen/Qwen2.5-1.5B-Instruct',
] as const

const API_URL = 'https://api-inference.huggingface.co/v1/chat/completions'
const DEFAULT_TIMEOUT_MS = 60000
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 2000

const SYSTEM_PROMPT = `Tu es un assistant tuteur pour étudiants tunisiens. 
Tu aides avec les matières: Algorithmique, Bases de Données, TIC, Mathématiques, et Physique.
Réponds de manière claire, concise et pédagogique en français.`

export async function generateResponse(
  messages: ChatMessage[],
  config: BrainConfig = {}
): Promise<BrainResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    return {
      response: '',
      model: 'none',
      error: 'HUGGINGFACE_API_KEY environment variable is not configured',
    }
  }

  const temperature = config.temperature ?? 0.7
  const maxTokens = config.maxTokens ?? 1024
  const timeout = config.timeout ?? DEFAULT_TIMEOUT_MS

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    for (const model of MODELS) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages,
            ],
            temperature,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'Unknown error')
          console.error(`HuggingFace API error for ${model}:`, response.status, errorBody)
          
          if (response.status === 503) {
            continue
          }
          
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (data.choices && data.choices.length > 0) {
          const content = data.choices[0]?.message?.content || ''
          return { response: content, model }
        }

        throw new Error('Invalid response format from HuggingFace API')
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`Request timed out for model ${model}`)
          continue
        }
        
        console.error(`Error with model ${model}:`, error)
        continue
      }
    }

    if (attempt < MAX_RETRIES) {
      console.log(`All models failed, retrying in ${RETRY_DELAY_MS}ms...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
    }
  }

  return {
    response: '',
    model: 'none',
    error: 'All models failed after retries',
  }
}

export function isValidResponse(response: BrainResponse): boolean {
  return response.response.length > 0 && !response.error
}

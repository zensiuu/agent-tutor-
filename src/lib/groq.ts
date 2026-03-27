// Use environment variable with fallback for development
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1'
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'
const DEFAULT_TIMEOUT_MS = 30000 // 30 seconds

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
}

/**
 * Sends a chat completion request to the Groq API
 * @throws {Error} If API key is missing, request fails, or timeout occurs
 */
export async function chatWithGroq(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not configured')
  }

  // Validate messages array
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array must contain at least one message')
  }

  // Validate each message has required fields
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      throw new Error('Each message must have a role and content')
    }
    if (!['system', 'user', 'assistant'].includes(msg.role)) {
      throw new Error(`Invalid message role: ${msg.role}`)
    }
  }

  const model = options.model || process.env.GROQ_MODEL || DEFAULT_MODEL
  const temperature = options.temperature ?? 0.7
  const maxTokens = options.maxTokens ?? 2048 // Increased from 1024 for better tutoring responses
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: Math.max(0, Math.min(2, temperature)), // Clamp to valid range
        max_tokens: Math.max(1, Math.min(8192, maxTokens)), // Clamp to valid range
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      console.error('Groq API error:', response.status, errorBody)
      throw new Error(`Groq API request failed with status ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid response format from Groq API')
    }

    const content = data.choices[0]?.message?.content
    if (typeof content !== 'string') {
      throw new Error('Invalid message content from Groq API')
    }

    return content
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Groq API request timed out after ${timeoutMs}ms`)
    }
    throw error
  }
}

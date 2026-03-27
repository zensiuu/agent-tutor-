// Use environment variable with fallback for development
const TINYFISH_API_URL = process.env.TINYFISH_API_URL || 'https://agent.tinyfish.ai/v1'
const DEFAULT_TIMEOUT_MS = 60000 // 60 seconds for web scraping

export interface TinyFishResult {
  success: boolean
  data?: unknown
  error?: string
}

/**
 * Runs a TinyFish web agent for automated web tasks
 * @param goal - The goal/task description for the agent
 * @param url - Optional URL to navigate to
 * @throws {Error} If API key is missing or request fails
 */
export async function runTinyFishAgent(
  goal: string,
  url?: string
): Promise<TinyFishResult> {
  const apiKey = process.env.TINYFISH_API_KEY
  
  if (!apiKey) {
    throw new Error('TINYFISH_API_KEY environment variable is not configured')
  }

  // Validate inputs
  if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
    throw new Error('Goal must be a non-empty string')
  }

  if (goal.length > 10000) {
    throw new Error('Goal exceeds maximum length of 10000 characters')
  }

  const targetUrl = url || 'https://www.google.com'
  
  // Validate URL format
  try {
    new URL(targetUrl)
  } catch {
    throw new Error('Invalid URL format provided')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(`${TINYFISH_API_URL}/automation/run-sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        url: targetUrl,
        goal: goal.trim(),
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('TinyFish API error:', response.status, errorText)
      throw new Error(`TinyFish API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: `TinyFish request timed out after ${DEFAULT_TIMEOUT_MS}ms`
      }
    }
    throw error
  }
}

/**
 * Performs a web search using TinyFish agent
 * @param query - The search query
 * @returns Search results from the web
 */
export async function searchWeb(query: string): Promise<TinyFishResult> {
  // Validate query
  if (!query || typeof query !== 'string') {
    return { success: false, error: 'Search query is required' }
  }

  const sanitizedQuery = query.trim()
  if (sanitizedQuery.length === 0) {
    return { success: false, error: 'Search query cannot be empty' }
  }

  if (sanitizedQuery.length > 1000) {
    return { success: false, error: 'Search query is too long (max 1000 characters)' }
  }

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(sanitizedQuery)}`
  
  return runTinyFishAgent(
    `Recherche: "${sanitizedQuery}". Trouve les informations les plus pertinentes et résume les résultats clés.`,
    searchUrl
  )
}

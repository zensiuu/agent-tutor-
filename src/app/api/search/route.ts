import { NextRequest, NextResponse } from 'next/server'
import { runTinyFishAgent, TinyFishResult } from '@/lib/tinyfish'

// Request validation limits
const MAX_QUERY_LENGTH = 1000
const REQUEST_TIMEOUT_MS = 90000 // 90 seconds (slightly less than Next.js default)

interface SearchRequest {
  query: string
}

interface SearchResponse {
  success: boolean
  data?: unknown
  error?: string
  query?: string
}

/**
 * Validates the search request body
 */
function validateSearchRequest(body: unknown): { valid: true; data: SearchRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' }
  }

  const data = body as Record<string, unknown>

  // Validate query
  if (typeof data.query !== 'string' || data.query.trim().length === 0) {
    return { valid: false, error: 'query is required and must be a non-empty string' }
  }

  const trimmedQuery = data.query.trim()

  if (trimmedQuery.length > MAX_QUERY_LENGTH) {
    return { valid: false, error: `query exceeds maximum length of ${MAX_QUERY_LENGTH} characters` }
  }

  return {
    valid: true,
    data: { query: trimmedQuery },
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const validation = validateSearchRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { query } = validation.data

    // Set up timeout for the entire operation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const result: TinyFishResult = await runTinyFishAgent(
        `Recherche: "${query}". Trouve les informations les plus pertinentes. Résume les résultats clés de manière claire.`
      )

      clearTimeout(timeoutId)

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || 'Search failed',
          query,
        })
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        query,
      })
    } catch (agentError) {
      clearTimeout(timeoutId)

      if (agentError instanceof Error && agentError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: `Search timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds`, query },
          { status: 504 }
        )
      }
      throw agentError
    }
  } catch (error) {
    console.error('Search error:', error)

    let errorMessage = 'Search failed'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('TINYFISH_API_KEY')) {
        errorMessage = 'Search service is not configured. Please contact administrator.'
        statusCode = 503
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Search request timed out. Please try again.'
        statusCode = 504
      } else {
        errorMessage = errorMessage // Keep generic message for other errors to avoid leaking internal details
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    )
  }
}

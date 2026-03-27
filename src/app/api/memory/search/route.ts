import { NextRequest, NextResponse } from 'next/server'
import { searchMemory } from '@/lib/memory'

// Request validation limits
const MAX_QUERY_LENGTH = 5000
const MAX_USER_ID_LENGTH = 100
const MAX_SESSION_ID_LENGTH = 100
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 5
const REQUEST_TIMEOUT_MS = 15000 // 15 seconds

interface SearchMemoryRequest {
  query: string
  userId: string
  sessionId?: string
  limit?: number
}

interface SearchMemoryResponse {
  memories: unknown[]
  error?: string
  query?: string
}

/**
 * Validates the search memory request body
 */
function validateSearchMemoryRequest(body: unknown): { valid: true; data: SearchMemoryRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' }
  }

  const data = body as Record<string, unknown>

  // Validate required fields
  if (typeof data.query !== 'string' || data.query.trim().length === 0) {
    return { valid: false, error: 'query is required and must be a non-empty string' }
  }

  if (typeof data.userId !== 'string' || data.userId.trim().length === 0) {
    return { valid: false, error: 'userId is required and must be a non-empty string' }
  }

  // Validate query length
  const trimmedQuery = data.query.trim()
  if (trimmedQuery.length > MAX_QUERY_LENGTH) {
    return { valid: false, error: `query exceeds maximum length of ${MAX_QUERY_LENGTH} characters` }
  }

  // Validate userId length
  const trimmedUserId = data.userId.trim()
  if (trimmedUserId.length > MAX_USER_ID_LENGTH) {
    return { valid: false, error: `userId exceeds maximum length of ${MAX_USER_ID_LENGTH} characters` }
  }

  // Validate optional sessionId
  if (data.sessionId !== undefined) {
    if (typeof data.sessionId !== 'string') {
      return { valid: false, error: 'sessionId must be a string' }
    }
    if (data.sessionId.length > MAX_SESSION_ID_LENGTH) {
      return { valid: false, error: `sessionId exceeds maximum length of ${MAX_SESSION_ID_LENGTH} characters` }
    }
  }

  // Validate optional limit
  if (data.limit !== undefined) {
    if (typeof data.limit !== 'number' || !Number.isInteger(data.limit)) {
      return { valid: false, error: 'limit must be an integer' }
    }
    if (data.limit < 1) {
      return { valid: false, error: 'limit must be at least 1' }
    }
    if (data.limit > MAX_LIMIT) {
      return { valid: false, error: `limit cannot exceed ${MAX_LIMIT}` }
    }
  }

  return {
    valid: true,
    data: {
      query: trimmedQuery,
      userId: trimmedUserId,
      sessionId: typeof data.sessionId === 'string' ? data.sessionId.trim() : undefined,
      limit: typeof data.limit === 'number' ? data.limit : DEFAULT_LIMIT,
    },
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<SearchMemoryResponse>> {
  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { memories: [], error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const validation = validateSearchMemoryRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { memories: [], error: validation.error },
        { status: 400 }
      )
    }

    const { query, userId, sessionId, limit } = validation.data

    // Set up timeout for the search operation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const memories = await searchMemory({
        query,
        userId,
        sessionId,
        limit,
      })

      clearTimeout(timeoutId)

      // Sanitize memories before returning
      const sanitizedMemories = memories.map(m => ({
        id: m.id,
        content: m.content,
        metadata: {
          userId: m.metadata.userId,
          sessionId: m.metadata.sessionId,
          timestamp: m.metadata.timestamp,
          type: m.metadata.type,
          subject: m.metadata.subject,
        },
      }))

      return NextResponse.json({ memories: sanitizedMemories, query })
    } catch (searchError) {
      clearTimeout(timeoutId)

      if (searchError instanceof Error && searchError.name === 'AbortError') {
        return NextResponse.json(
          { memories: [], error: `Search timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds`, query },
          { status: 504 }
        )
      }
      throw searchError
    }
  } catch (error) {
    console.error('Search memory error:', error)

    let errorMessage = 'Failed to search memory'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Memory search timed out. Please try again.'
        statusCode = 504
      } else if (error.message.includes('GROQ_API_KEY')) {
        errorMessage = 'Memory service is not properly configured.'
        statusCode = 503
      } else {
        errorMessage = errorMessage // Keep generic message
      }
    }

    return NextResponse.json(
      { memories: [], error: errorMessage },
      { status: statusCode }
    )
  }
}

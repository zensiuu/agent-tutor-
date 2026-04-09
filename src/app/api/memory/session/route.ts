import { NextRequest, NextResponse } from 'next/server'
import { getSessionMemory } from '@/lib/memory'
import type { SanitizedMemoryEntry } from '@/types/types'
import { VALIDATION_LIMITS } from '@/types/types'

const MAX_SESSION_ID_LENGTH = VALIDATION_LIMITS.MAX_SESSION_ID_LENGTH
const MAX_USER_ID_LENGTH = VALIDATION_LIMITS.MAX_USER_ID_LENGTH
const REQUEST_TIMEOUT_MS = 15000

interface GetSessionMemoryRequest {
  sessionId: string
  userId: string
}

interface GetSessionMemoryResponse {
  memories: SanitizedMemoryEntry[]
  error?: string
  sessionId?: string
}

/**
 * Validates the get session memory request body
 */
function validateGetSessionMemoryRequest(body: unknown): { valid: true; data: GetSessionMemoryRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' }
  }

  const data = body as Record<string, unknown>

  // Validate required fields
  if (typeof data.sessionId !== 'string' || data.sessionId.trim().length === 0) {
    return { valid: false, error: 'sessionId is required and must be a non-empty string' }
  }

  if (typeof data.userId !== 'string' || data.userId.trim().length === 0) {
    return { valid: false, error: 'userId is required and must be a non-empty string' }
  }

  // Validate sessionId length
  const trimmedSessionId = data.sessionId.trim()
  if (trimmedSessionId.length > MAX_SESSION_ID_LENGTH) {
    return { valid: false, error: `sessionId exceeds maximum length of ${MAX_SESSION_ID_LENGTH} characters` }
  }

  // Validate userId length
  const trimmedUserId = data.userId.trim()
  if (trimmedUserId.length > MAX_USER_ID_LENGTH) {
    return { valid: false, error: `userId exceeds maximum length of ${MAX_USER_ID_LENGTH} characters` }
  }

  return {
    valid: true,
    data: {
      sessionId: trimmedSessionId,
      userId: trimmedUserId,
    },
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<GetSessionMemoryResponse>> {
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

    const validation = validateGetSessionMemoryRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { memories: [], error: validation.error },
        { status: 400 }
      )
    }

    const { sessionId, userId } = validation.data

    // Set up timeout for the get session memory operation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const memories = await getSessionMemory(sessionId, userId)

      clearTimeout(timeoutId)

      // Sanitize memories before returning
      const sanitizedMemories: SanitizedMemoryEntry[] = memories.map(m => ({
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

      return NextResponse.json({ memories: sanitizedMemories, sessionId })
    } catch (getError) {
      clearTimeout(timeoutId)

      if (getError instanceof Error && getError.name === 'AbortError') {
        return NextResponse.json(
          { memories: [], error: `Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds`, sessionId },
          { status: 504 }
        )
      }
      throw getError
    }
  } catch (error) {
    console.error('Get session memory error:', error)

    let errorMessage = 'Failed to get session memory'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Session memory retrieval timed out. Please try again.'
        statusCode = 504
      } else if (error.message.includes('GROQ_API_KEY')) {
        errorMessage = 'Memory service is not properly configured.'
        statusCode = 503
      } else {
        errorMessage = errorMessage
      }
    }

    return NextResponse.json(
      { memories: [], error: errorMessage },
      { status: statusCode }
    )
  }
}

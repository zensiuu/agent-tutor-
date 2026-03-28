import { NextRequest, NextResponse } from 'next/server'
import { storeMemory } from '@/lib/memory'
import type { MemoryEntry, ValidMemoryType, StoreMemoryResponse } from '@/lib/types'
import { VALIDATION_LIMITS, isValidMemoryType } from '@/lib/types'

// Request validation limits (deprecated - use VALIDATION_LIMITS from types)
const MAX_CONTENT_LENGTH = VALIDATION_LIMITS.MAX_CONTENT_LENGTH
const MAX_USER_ID_LENGTH = VALIDATION_LIMITS.MAX_USER_ID_LENGTH
const MAX_SESSION_ID_LENGTH = VALIDATION_LIMITS.MAX_SESSION_ID_LENGTH
const MAX_SUBJECT_LENGTH = 100

interface StoreMemoryRequest {
  content: string
  userId: string
  sessionId: string
  type?: ValidMemoryType
  subject?: string
}

/**
 * Validates the store memory request body
 */
function validateStoreMemoryRequest(body: unknown): { valid: true; data: StoreMemoryRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' }
  }

  const data = body as Record<string, unknown>

  // Validate required fields
  if (typeof data.content !== 'string' || data.content.trim().length === 0) {
    return { valid: false, error: 'content is required and must be a non-empty string' }
  }

  if (typeof data.userId !== 'string' || data.userId.trim().length === 0) {
    return { valid: false, error: 'userId is required and must be a non-empty string' }
  }

  if (typeof data.sessionId !== 'string' || data.sessionId.trim().length === 0) {
    return { valid: false, error: 'sessionId is required and must be a non-empty string' }
  }

  // Validate content length
  const trimmedContent = data.content.trim()
  if (trimmedContent.length > MAX_CONTENT_LENGTH) {
    return { valid: false, error: `content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` }
  }

  // Validate userId length
  const trimmedUserId = data.userId.trim()
  if (trimmedUserId.length > MAX_USER_ID_LENGTH) {
    return { valid: false, error: `userId exceeds maximum length of ${MAX_USER_ID_LENGTH} characters` }
  }

  // Validate sessionId length
  const trimmedSessionId = data.sessionId.trim()
  if (trimmedSessionId.length > MAX_SESSION_ID_LENGTH) {
    return { valid: false, error: `sessionId exceeds maximum length of ${MAX_SESSION_ID_LENGTH} characters` }
  }

  // Validate optional type
  if (data.type !== undefined) {
    if (typeof data.type !== 'string') {
      return { valid: false, error: 'type must be a string' }
    }
    if (!isValidMemoryType(data.type)) {
      return { valid: false, error: 'type must be one of: interaction, note, topic, question' }
    }
  }

  // Validate optional subject
  if (data.subject !== undefined) {
    if (typeof data.subject !== 'string') {
      return { valid: false, error: 'subject must be a string' }
    }
    if (data.subject.length > MAX_SUBJECT_LENGTH) {
      return { valid: false, error: `subject exceeds maximum length of ${MAX_SUBJECT_LENGTH} characters` }
    }
  }

  return {
    valid: true,
    data: {
      content: trimmedContent,
      userId: trimmedUserId,
      sessionId: trimmedSessionId,
      type: data.type as ValidMemoryType | undefined,
      subject: typeof data.subject === 'string' ? data.subject.trim() : undefined,
    },
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<StoreMemoryResponse>> {
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

    const validation = validateStoreMemoryRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { content, userId, sessionId, type, subject } = validation.data

    // Set timeout for memory storage
    const entry: MemoryEntry = await Promise.race([
      storeMemory({
        content,
        userId,
        sessionId,
        type: type || 'interaction',
        subject,
      }),
      new Promise<MemoryEntry>((_, reject) =>
        setTimeout(() => reject(new Error('Memory storage timeout')), 10000)
      ),
    ])

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        content: entry.content,
        metadata: entry.metadata,
      },
    })
  } catch (error) {
    console.error('Store memory error:', error)

    let errorMessage = 'Failed to store memory'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Memory storage timed out. Please try again.'
        statusCode = 504
      } else if (error.message.includes('GROQ_API_KEY')) {
        errorMessage = 'Memory service is not properly configured.'
        statusCode = 503
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    )
  }
}

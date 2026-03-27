import { NextRequest, NextResponse } from 'next/server'
import { chatWithGroq, ChatMessage } from '@/lib/groq'
import { SYSTEM_PROMPT } from '@/lib/subjects'
import { searchMemory, storeMemory, buildContextPrompt } from '@/lib/memory'

// Request validation limits
const MAX_MESSAGE_LENGTH = 10000
const MAX_HISTORY_LENGTH = 50
const MAX_USER_ID_LENGTH = 100
const MAX_SESSION_ID_LENGTH = 100

interface ChatRequestBody {
  message: string
  history?: ChatMessage[]
  userId?: string
  sessionId?: string
}

/**
 * Validates the chat request body
 */
function validateChatRequest(body: unknown): { valid: true; data: ChatRequestBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' }
  }

  const data = body as Record<string, unknown>

  // Validate message
  if (typeof data.message !== 'string' || data.message.trim().length === 0) {
    return { valid: false, error: 'message is required and must be a non-empty string' }
  }

  if (data.message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` }
  }

  // Validate optional history array
  if (data.history !== undefined) {
    if (!Array.isArray(data.history)) {
      return { valid: false, error: 'history must be an array' }
    }

    if (data.history.length > MAX_HISTORY_LENGTH) {
      return { valid: false, error: `history exceeds maximum length of ${MAX_HISTORY_LENGTH} messages` }
    }

    for (let i = 0; i < data.history.length; i++) {
      const msg = data.history[i]
      if (!msg || typeof msg !== 'object') {
        return { valid: false, error: `history[${i}] must be an object` }
      }
      if (!['system', 'user', 'assistant'].includes((msg as ChatMessage).role)) {
        return { valid: false, error: `history[${i}] has invalid role: ${(msg as ChatMessage).role}` }
      }
      if (typeof (msg as ChatMessage).content !== 'string') {
        return { valid: false, error: `history[${i}] must have a string content` }
      }
    }
  }

  // Validate optional userId
  if (data.userId !== undefined) {
    if (typeof data.userId !== 'string') {
      return { valid: false, error: 'userId must be a string' }
    }
    if (data.userId.length > MAX_USER_ID_LENGTH) {
      return { valid: false, error: `userId exceeds maximum length of ${MAX_USER_ID_LENGTH} characters` }
    }
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

  return {
    valid: true,
    data: {
      message: data.message.trim(),
      history: data.history as ChatMessage[] | undefined,
      userId: typeof data.userId === 'string' ? data.userId.trim() : 'anonymous',
      sessionId: typeof data.sessionId === 'string' ? data.sessionId.trim() : `session_${Date.now()}`,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const validation = validateChatRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { message, history, userId, sessionId } = validation.data

    // Search for relevant memories with timeout
    let relevantMemories: Awaited<ReturnType<typeof searchMemory>> = []
    try {
      relevantMemories = await Promise.race([
        searchMemory({
          query: message,
          userId,
          limit: 3,
        }),
        new Promise<typeof relevantMemories>((_, reject) =>
          setTimeout(() => reject(new Error('Memory search timeout')), 5000)
        ),
      ])
    } catch (memError) {
      console.warn('Memory search failed, continuing without context:', memError)
    }

    const contextPrompt = buildContextPrompt(relevantMemories)

    // Build messages array with sanitized history
    const sanitizedHistory = (history || []).filter(
      msg => msg && typeof msg.role === 'string' && typeof msg.content === 'string'
    )

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
      ...sanitizedHistory,
      { role: 'user', content: message },
    ]

    // Get AI response with timeout
    const response = await Promise.race([
      chatWithGroq(messages),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 30000)
      ),
    ])

    // Store interaction in memory (non-blocking, don't fail the request if this fails)
    storeMemory({
      content: `Question: ${message}\nRéponse: ${response}`,
      userId,
      sessionId,
      type: 'interaction',
    }).catch(err => {
      console.warn('Failed to store memory:', err)
    })

    return NextResponse.json({
      response,
      memories: relevantMemories.length,
    })
  } catch (error) {
    console.error('Chat error:', error)

    // Provide specific error messages based on error type
    let errorMessage = 'An unexpected error occurred'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('GROQ_API_KEY')) {
        errorMessage = 'AI service is not configured. Please contact administrator.'
        statusCode = 503
      } else if (error.message.includes('timeout')) {
        errorMessage = 'The request took too long. Please try again.'
        statusCode = 504
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

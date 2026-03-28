import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/brain'
import { searchMemory, storeMemory, buildContextPrompt } from '@/lib/memory'
import type { ChatMessage, ValidMemoryType } from '@/lib/types'

interface ChatRequestBody {
  message: string
  history?: ChatMessage[]
  userId?: string
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json()

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      )
    }

    const message = body.message.trim()
    const userId = body.userId?.trim() || 'anonymous'
    const sessionId = body.sessionId?.trim() || `session_${Date.now()}`

    let relevantMemories: Awaited<ReturnType<typeof searchMemory>> = []
    try {
      relevantMemories = await Promise.race([
        searchMemory({ query: message, userId, limit: 3 }),
        new Promise<typeof relevantMemories>((_, reject) =>
          setTimeout(() => reject(new Error('Memory timeout')), 5000)
        ),
      ])
    } catch (memError) {
      console.warn('Memory search failed:', memError)
    }

    const contextPrompt = buildContextPrompt(relevantMemories)

    const sanitizedHistory: ChatMessage[] = (body.history || []).filter(
      (msg): msg is ChatMessage => msg && typeof msg.role === 'string' && typeof msg.content === 'string'
    )

    const messages: ChatMessage[] = [
      ...sanitizedHistory,
      { role: 'user', content: message },
    ]

    const result = await generateResponse(messages)

    if (result.error) {
      return NextResponse.json(
        { response: '', error: result.error },
        { status: 500 }
      )
    }

    storeMemory({
      content: `Question: ${message}\nRéponse: ${result.response}`,
      userId,
      sessionId,
      type: 'interaction' as ValidMemoryType,
    }).catch(err => {
      console.warn('Failed to store memory:', err)
    })

    return NextResponse.json({
      response: result.response,
      memories: relevantMemories.length,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { response: '', error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { chatWithGroq, ChatMessage } from '@/lib/groq'
import { SYSTEM_PROMPT } from '@/lib/subjects'
import { searchMemory, storeMemory, buildContextPrompt } from '@/lib/memory'

export async function POST(request: NextRequest) {
  try {
    const { message, history, userId = 'default', sessionId = 'default' } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const relevantMemories = await searchMemory({
      query: message,
      userId,
      limit: 3,
    })

    const contextPrompt = buildContextPrompt(relevantMemories)

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
      ...(history || []),
      { role: 'user', content: message },
    ]

    const response = await chatWithGroq(messages)

    await storeMemory({
      content: `Question: ${message}\nRéponse: ${response}`,
      userId,
      sessionId,
      type: 'interaction',
    })

    return NextResponse.json({ 
      response,
      memories: relevantMemories.length,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    )
  }
}

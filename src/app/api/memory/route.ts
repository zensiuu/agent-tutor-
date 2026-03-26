import { NextRequest, NextResponse } from 'next/server'
import { storeMemory } from '@/lib/memory'

export async function POST(request: NextRequest) {
  try {
    const { content, userId, sessionId, type, subject } = await request.json()

    if (!content || !userId || !sessionId) {
      return NextResponse.json(
        { error: 'content, userId, sessionId required' },
        { status: 400 }
      )
    }

    const entry = await storeMemory({
      content,
      userId,
      sessionId,
      type: type || 'interaction',
      subject,
    })

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error('Store memory error:', error)
    return NextResponse.json(
      { error: 'Failed to store memory' },
      { status: 500 }
    )
  }
}

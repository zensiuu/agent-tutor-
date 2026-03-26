import { NextRequest, NextResponse } from 'next/server'
import { getSessionMemory } from '@/lib/memory'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json()

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'sessionId and userId required' },
        { status: 400 }
      )
    }

    const memories = await getSessionMemory(sessionId, userId)

    return NextResponse.json({ memories })
  } catch (error) {
    console.error('Get session memory error:', error)
    return NextResponse.json(
      { error: 'Failed to get session memory' },
      { status: 500 }
    )
  }
}

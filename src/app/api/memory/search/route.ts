import { NextRequest, NextResponse } from 'next/server'
import { searchMemory } from '@/lib/memory'

export async function POST(request: NextRequest) {
  try {
    const { query, userId, sessionId, limit } = await request.json()

    if (!query || !userId) {
      return NextResponse.json(
        { error: 'query and userId required' },
        { status: 400 }
      )
    }

    const memories = await searchMemory({
      query,
      userId,
      sessionId,
      limit: limit || 5,
    })

    return NextResponse.json({ memories })
  } catch (error) {
    console.error('Search memory error:', error)
    return NextResponse.json(
      { error: 'Failed to search memory' },
      { status: 500 }
    )
  }
}

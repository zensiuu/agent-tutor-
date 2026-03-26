import { NextRequest, NextResponse } from 'next/server'
import { runTinyFishAgent } from '@/lib/tinyfish'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    const result = await runTinyFishAgent(
      `Recherche: "${query}". Trouve les informations les plus pertinentes.`
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

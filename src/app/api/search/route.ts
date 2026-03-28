import { NextRequest, NextResponse } from 'next/server'
import { searchWeb, deepSearch } from '@/lib/search'
import type { SearchRequest, SearchResponse } from '@/lib/types'

interface ExtendedSearchRequest extends SearchRequest {
  deepSearch?: boolean
}

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    const body: ExtendedSearchRequest = await request.json()

    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'query is required' },
        { status: 400 }
      )
    }

    const useDeepSearch = body.deepSearch === true
    const result = useDeepSearch
      ? await deepSearch(body.query)
      : await searchWeb(body.query)

    return NextResponse.json({
      success: result.success,
      data: result.results || [],
      error: result.error,
      query: body.query,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

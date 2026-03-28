/**
 * Tavily Search Module
 * Handles web search via Tavily API
 * Optimized for AI applications
 */

import type { TavilyResponse, TavilySearchResult } from '../types'

const TAVILY_API_URL = 'https://api.tavily.com/search'
const DEFAULT_TIMEOUT_MS = 30000
const MAX_QUERY_LENGTH = 500

export async function searchWeb(query: string, deepSearch = false): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'TAVILY_API_KEY environment variable is not configured',
    }
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return {
      success: false,
      error: 'Search query is required',
    }
  }

  const sanitizedQuery = query.trim().slice(0, MAX_QUERY_LENGTH)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: sanitizedQuery,
        search_depth: deepSearch ? 'advanced' : 'basic',
        max_results: deepSearch ? 10 : 5,
        include_answer: true,
        include_raw_content: false,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Tavily API error:', response.status, errorText)
      throw new Error(`Tavily API request failed with status ${response.status}`)
    }

    const data = await response.json()

    const results: TavilySearchResult[] = (data.results || []).map((r: {
      url?: string
      title?: string
      content?: string
      published_date?: string
    }) => ({
      url: r.url || '',
      title: r.title || '',
      content: r.content || '',
      publishedDate: r.published_date,
    }))

    return {
      success: true,
      results,
      answer: data.answer,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: `Tavily request timed out after ${DEFAULT_TIMEOUT_MS}ms`,
      }
    }

    console.error('Tavily search error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function deepSearch(query: string): Promise<TavilyResponse> {
  return searchWeb(query, true)
}

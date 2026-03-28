# Tunisian Tutor v2.0 - HuggingFace & Tavily Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Groq with HuggingFace Inference API for the brain, and TinyFish with Tavily for search.

**Architecture:** 
- Brain (LLM): HuggingFace Inference API with automatic fallback between DeepSeek-R1-Distill-Qwen-7B, Qwen2.5-7B, and Qwen2.5-1.5B
- Embeddings: HuggingFace sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2)
- Search: Tavily API (clean, AI-optimized results)
- Memory & Voice: Keep existing Pinecone and Deepgram integrations

**Tech Stack:** Next.js 15, TypeScript, HuggingFace Inference API, Tavily Search API, Pinecone, Deepgram

---

## File Structure

### To Be Created
- `src/lib/brain.ts` - HuggingFace inference client for chat completions
- `src/lib/embeddings.ts` - HuggingFace embeddings for memory
- `src/lib/search/tavily.ts` - Tavily search client

### To Be Removed
- `src/lib/groq.ts` - Replaced by brain.ts
- `src/lib/tinyfish.ts` - Replaced by Tavily

### To Be Modified
- `src/lib/types.ts` - Update search result types, remove TinyFish types
- `src/lib/memory.ts` - Switch from Groq embeddings to HuggingFace embeddings
- `src/lib/subjects.ts` - Import from types.ts
- `src/app/api/chat/route.ts` - Use HuggingFace brain instead of Groq
- `src/app/api/search/route.ts` - Use Tavily instead of TinyFish
- `src/app/api/memory/route.ts` - Use HuggingFace embeddings
- `src/app/api/memory/search/route.ts` - Use HuggingFace embeddings
- `src/app/api/memory/session/route.ts` - Use HuggingFace embeddings
- `src/app/api/voice/route.ts` - Keep Deepgram, update imports
- `src/components/chat/chat-interface.tsx` - Update imports
- `src/components/workspace/workspace.tsx` - Update imports
- `.env.example` - Update environment variables
- `DEPLOYMENT.md` - Update deployment requirements
- `next.config.js` - Update CSP if needed

---

## Tasks

### Task 1: Create HuggingFace Brain Client (`src/lib/brain.ts`)

**Files:**
- Create: `src/lib/brain.ts`
- Test: Manual API test

- [ ] **Step 1: Create brain.ts with HuggingFace Inference API client**

```typescript
/**
 * Brain Module
 * Handles LLM inference via HuggingFace Inference API
 * Supports multiple models with automatic fallback
 */

export interface BrainConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface BrainResponse {
  response: string
  model: string
  error?: string
}

const MODELS = [
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
  'Qwen/Qwen2.5-7B-Instruct',
  'Qwen/Qwen2.5-1.5B-Instruct',
] as const

const API_URL = 'https://api-inference.huggingface.co/v1/chat/completions'
const DEFAULT_TIMEOUT_MS = 60000
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 2000

const SYSTEM_PROMPT = `Tu es un assistant tuteur pour étudiants tunisiens. 
Tu aides avec les matières: Algorithmique, Bases de Données, TIC, Mathématiques, et Physique.
Réponds de manière claire, concise et pédagogique en français.`

/**
 * Sends a chat completion request to HuggingFace Inference API
 */
export async function generateResponse(
  messages: ChatMessage[],
  config: BrainConfig = {}
): Promise<BrainResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    return {
      response: '',
      model: 'none',
      error: 'HUGGINGFACE_API_KEY environment variable is not configured',
    }
  }

  const temperature = config.temperature ?? 0.7
  const maxTokens = config.maxTokens ?? 1024
  const timeout = config.timeout ?? DEFAULT_TIMEOUT_MS

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    for (const model of MODELS) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages,
            ],
            temperature,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'Unknown error')
          console.error(`HuggingFace API error for ${model}:`, response.status, errorBody)
          
          if (response.status === 503) {
            continue
          }
          
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (data.choices && data.choices.length > 0) {
          const content = data.choices[0]?.message?.content || ''
          return { response: content, model }
        }

        throw new Error('Invalid response format from HuggingFace API')
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`Request timed out for model ${model}`)
          continue
        }
        
        console.error(`Error with model ${model}:`, error)
        continue
      }
    }

    if (attempt < MAX_RETRIES) {
      console.log(`All models failed, retrying in ${RETRY_DELAY_MS}ms...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
    }
  }

  return {
    response: '',
    model: 'none',
    error: 'All models failed after retries',
  }
}

/**
 * Validates if a response is usable
 */
export function isValidResponse(response: BrainResponse): boolean {
  return response.response.length > 0 && !response.error
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors for brain.ts

- [ ] **Step 3: Commit**

```bash
git add src/lib/brain.ts
git commit -m "feat: add HuggingFace brain client with model fallback"
```

---

### Task 2: Create HuggingFace Embeddings Client (`src/lib/embeddings.ts`)

**Files:**
- Create: `src/lib/embeddings.ts`
- Modify: `src/lib/memory.ts` (update to use embeddings.ts)

- [ ] **Step 1: Create embeddings.ts**

```typescript
/**
 * Embeddings Module
 * Handles text embedding generation via HuggingFace Inference API
 */

export interface EmbeddingResponse {
  embedding: number[]
  model: string
  error?: string
}

const EMBEDDING_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
const EMBEDDING_TIMEOUT_MS = 30000
const MAX_TEXT_LENGTH = 500
const VECTOR_DIMENSIONS = 384

/**
 * Generates an embedding vector for the given text
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    return {
      embedding: new Array(VECTOR_DIMENSIONS).fill(0),
      model: 'none',
      error: 'HUGGINGFACE_API_KEY not configured',
    }
  }

  const truncatedText = text.slice(0, MAX_TEXT_LENGTH)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EMBEDDING_TIMEOUT_MS)

  try {
    const response = await fetch(EMBEDDING_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: truncatedText,
        options: {
          wait_for_model: true,
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      console.error('Embedding API error:', response.status, errorBody)
      throw new Error(`Embedding API request failed with status ${response.status}`)
    }

    const embedding = await response.json()

    if (!Array.isArray(embedding)) {
      throw new Error('Invalid embedding format')
    }

    return {
      embedding: Array.isArray(embedding[0]) ? embedding[0] : embedding,
      model: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        embedding: new Array(VECTOR_DIMENSIONS).fill(0),
        model: 'none',
        error: `Embedding request timed out after ${EMBEDDING_TIMEOUT_MS}ms`,
      }
    }

    console.error('Embedding generation error:', error)
    return {
      embedding: new Array(VECTOR_DIMENSIONS).fill(0),
      model: 'none',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Returns the expected vector dimensions for this model
 */
export function getEmbeddingDimensions(): number {
  return VECTOR_DIMENSIONS
}
```

- [ ] **Step 2: Update memory.ts to use new embeddings module**

Replace the embedding generation in memory.ts:

```typescript
// Replace the old generateEmbedding function and imports
import { generateEmbedding, getEmbeddingDimensions } from './embeddings'

// Update the config
const DEFAULT_VECTOR_DIM = getEmbeddingDimensions()

// Update generateEmbedding call in storeMemory and searchMemory
// to use the new async function properly
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/embeddings.ts src/lib/memory.ts
git commit -m "feat: add HuggingFace embeddings, refactor memory module"
```

---

### Task 3: Create Tavily Search Client (`src/lib/search/tavily.ts`)

**Files:**
- Create: `src/lib/search/tavily.ts`
- Create: `src/lib/search/index.ts`
- Modify: `src/lib/types.ts` (add Tavily types)

- [ ] **Step 1: Update types.ts - add Tavily types**

```typescript
// Add after TinyFishResult type
export interface TavilySearchResult {
  url: string
  title: string
  content: string
  publishedDate?: string
}

export interface TavilyResponse {
  success: boolean
  results?: TavilySearchResult[]
  answer?: string
  error?: string
}
```

- [ ] **Step 2: Create tavily.ts**

```typescript
/**
 * Tavily Search Module
 * Handles web search via Tavily API
 * Optimized for AI applications
 */

import type { TavilyResponse, TavilySearchResult } from '../types'

const TAVILY_API_URL = 'https://api.tavily.com/search'
const DEFAULT_TIMEOUT_MS = 30000
const MAX_QUERY_LENGTH = 500

/**
 * Performs a web search using Tavily API
 */
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

/**
 * Performs a deep/advanced search for complex queries
 */
export async function deepSearch(query: string): Promise<TavilyResponse> {
  return searchWeb(query, true)
}
```

- [ ] **Step 3: Create search/index.ts**

```typescript
export { searchWeb, deepSearch } from './tavily'
export type { TavilyResponse, TavilySearchResult } from '../types'
```

- [ ] **Step 4: Remove old tinyfish files**

Run: `rm src/lib/tinyfish.ts`

- [ ] **Step 5: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/search/ src/lib/types.ts
git rm src/lib/tinyfish.ts
git commit -m "feat: add Tavily search, remove TinyFish"
```

---

### Task 4: Update API Routes

**Files:**
- Modify: `src/app/api/chat/route.ts`
- Modify: `src/app/api/search/route.ts`

- [ ] **Step 1: Update chat/route.ts - use brain instead of groq**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/brain'
import type { ChatRequest, ChatResponse } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const history = body.history || []
    const messages = [
      ...history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: body.message },
    ]

    const result = await generateResponse(messages)

    if (result.error) {
      return NextResponse.json(
        { response: '', error: result.error },
        { status: 500 }
      )
    }

    const response: ChatResponse = {
      response: result.response,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { response: '', error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Update search/route.ts - use Tavily**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { searchWeb, deepSearch } from '@/lib/search'
import type { SearchRequest, SearchResponse } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()

    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      )
    }

    const useDeepSearch = body.deepSearch === true
    const result = useDeepSearch
      ? await deepSearch(body.query)
      : await searchWeb(body.query)

    const response: SearchResponse = {
      success: result.success,
      data: result.results || [],
      error: result.error,
      query: body.query,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/route.ts src/app/api/search/route.ts
git commit -m "refactor: switch to HuggingFace brain and Tavily search"
```

---

### Task 5: Update Memory API Routes

**Files:**
- Modify: `src/app/api/memory/route.ts`
- Modify: `src/app/api/memory/search/route.ts`
- Modify: `src/app/api/memory/session/route.ts`

- [ ] **Step 1: Update memory routes to use new embeddings**

The routes should already work since we updated memory.ts. Just verify imports are correct:

```typescript
// Verify these imports are in each file:
import { storeMemory } from '@/lib/memory'
import type { StoreMemoryParams, StoreMemoryResponse } from '@/lib/types'
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/memory/
git commit -m "chore: update memory routes for HuggingFace embeddings"
```

---

### Task 6: Update Environment Configuration

**Files:**
- Modify: `.env.example`
- Modify: `DEPLOYMENT.md`
- Create: `docs/superpowers/specs/YYYY-MM-DD-tunisian-tutor-v2-design.md`

- [ ] **Step 1: Update .env.example**

```bash
# HuggingFace (Brain & Embeddings) - REQUIRED
HUGGINGFACE_API_KEY=hf_your_token_here

# Tavily (Web Search) - REQUIRED
TAVILY_API_KEY=tvly_your_api_key_here

# Deepgram (Voice) - REQUIRED
DEEPGRAM_API_KEY=your_deepgram_key_here

# Pinecone (Memory) - REQUIRED
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX_URL=https://your-index.serve.pinecone.io

# Optional: Remove old Groq key reference
# GROQ_API_KEY= (REMOVED - no longer used)
```

- [ ] **Step 2: Update DEPLOYMENT.md**

Update the environment variables section and remove references to Groq/TinyFish.

- [ ] **Step 3: Create design spec document**

```markdown
# Tunisian Tutor v2.0 Design Spec

> Date: 2026-03-28

## Overview
Migrated from Groq to HuggingFace Inference API for brain functionality.
Migrated from TinyFish to Tavily for web search.

## Architecture

### Components
- **Brain**: HuggingFace Inference API (DeepSeek-R1, Qwen2.5 models)
- **Embeddings**: HuggingFace sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2)
- **Search**: Tavily API
- **Voice**: Deepgram (unchanged)
- **Memory**: Pinecone (unchanged)

### Data Flow
1. User input → Frontend
2. Frontend → API routes
3. API routes → Brain/Search/Memory modules
4. Modules → External APIs (HuggingFace, Tavily, Deepgram, Pinecone)
5. Response → Frontend

## Environment Variables
See `.env.example` for required variables.
```

- [ ] **Step 4: Commit**

```bash
git add .env.example DEPLOYMENT.md docs/
git commit -m "docs: update environment config and design spec"
```

---

### Task 7: Final Verification

**Files:**
- All project files

- [ ] **Step 1: Run build**

Run: `npm run build`
Expected: Build completes successfully

- [ ] **Step 2: Run lint**

Run: `npm run lint` (if available)
Expected: No lint errors

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete Tunisian Tutor v2.0 with HuggingFace and Tavily"
```

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/lib/brain.ts` | Create - HuggingFace inference client |
| `src/lib/embeddings.ts` | Create - HuggingFace embeddings |
| `src/lib/search/tavily.ts` | Create - Tavily search client |
| `src/lib/memory.ts` | Modify - Use new embeddings |
| `src/lib/types.ts` | Modify - Add Tavily types, remove TinyFish |
| `src/lib/groq.ts` | Delete - No longer needed |
| `src/lib/tinyfish.ts` | Delete - Replaced by Tavily |
| `src/app/api/chat/route.ts` | Modify - Use brain module |
| `src/app/api/search/route.ts` | Modify - Use Tavily |
| `.env.example` | Modify - Update variables |
| `DEPLOYMENT.md` | Modify - Update docs |

---

## API Keys Required

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| HuggingFace | Brain + Embeddings | Rate limited (free tier) |
| Tavily | Search | 1000 credits/month |
| Deepgram | Voice STT | 200 min/month |
| Pinecone | Vector storage | 1M vectors |

---

## Deployment Checklist

- [ ] Get HuggingFace API key from https://huggingface.co/settings/inference-endpoints
- [ ] Get Tavily API key from https://tavily.com
- [ ] Keep existing Deepgram and Pinecone keys
- [ ] Update Vercel environment variables
- [ ] Remove `GROQ_API_KEY` from Vercel
- [ ] Test chat functionality
- [ ] Test search functionality
- [ ] Test voice input
- [ ] Verify memory storage and retrieval

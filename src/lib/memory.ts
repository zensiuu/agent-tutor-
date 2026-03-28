/**
 * Memory Module
 * Handles vector storage and retrieval via Pinecone
 * Uses HuggingFace for embedding generation
 */

export type {
  MemoryEntry,
  MemoryMetadata,
  MemoryType,
  StoreMemoryParams,
  SearchMemoryParams,
  ValidMemoryType,
} from './types'

import type {
  MemoryEntry,
  StoreMemoryParams,
  SearchMemoryParams,
  ValidMemoryType,
} from './types'

import { generateEmbedding, getEmbeddingDimensions } from './embeddings'

const DEFAULT_VECTOR_DIM = getEmbeddingDimensions()
const PINECONE_TIMEOUT_MS = 10000

function getPineconeConfig() {
  return {
    url: process.env.PINECONE_INDEX_URL,
    apiKey: process.env.PINECONE_API_KEY,
  }
}

function generateId(): string {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 11)
  return `mem_${timestamp}_${randomPart}`
}

export async function storeMemory(params: StoreMemoryParams): Promise<MemoryEntry> {
  if (!params.content || typeof params.content !== 'string') {
    throw new Error('content is required and must be a string')
  }
  if (!params.userId || typeof params.userId !== 'string') {
    throw new Error('userId is required and must be a string')
  }
  if (!params.sessionId || typeof params.sessionId !== 'string') {
    throw new Error('sessionId is required and must be a string')
  }

  const sanitizedContent = params.content.trim()
  const sanitizedUserId = params.userId.trim()
  const sanitizedSessionId = params.sessionId.trim()

  if (sanitizedContent.length === 0) {
    throw new Error('content cannot be empty')
  }

  const storedContent = sanitizedContent.slice(0, 1000)

  const entry: MemoryEntry = {
    id: generateId(),
    content: sanitizedContent,
    metadata: {
      userId: sanitizedUserId,
      sessionId: sanitizedSessionId,
      timestamp: new Date().toISOString(),
      type: params.type || 'interaction',
      subject: params.subject?.trim(),
    },
  }

  try {
    const embeddingResult = await generateEmbedding(sanitizedContent)
    if (embeddingResult.error) {
      console.error('Embedding generation failed:', embeddingResult.error)
    } else {
      entry.embedding = embeddingResult.embedding
    }

    const { url: pineconeUrl, apiKey: pineconeApiKey } = getPineconeConfig()

    if (pineconeUrl && pineconeApiKey && entry.embedding) {
      const upsertController = new AbortController()
      const upsertTimeout = setTimeout(() => upsertController.abort(), PINECONE_TIMEOUT_MS)

      try {
        const response = await fetch(`${pineconeUrl}/vectors/upsert`, {
          method: 'POST',
          headers: {
            'Api-Key': pineconeApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vectors: [{
              id: entry.id,
              values: entry.embedding,
              metadata: {
                content: storedContent,
                userId: sanitizedUserId,
                sessionId: sanitizedSessionId,
                timestamp: entry.metadata.timestamp,
                type: entry.metadata.type,
                subject: entry.metadata.subject || '',
              },
            }],
          }),
          signal: upsertController.signal,
        })

        clearTimeout(upsertTimeout)

        if (!response.ok) {
          console.error('Pinecone upsert failed:', response.status)
        }
      } catch (upsertError) {
        clearTimeout(upsertTimeout)
        console.error('Pinecone upsert error:', upsertError)
      }
    }
  } catch (error) {
    console.error('Memory store error:', error)
  }

  return entry
}

interface PineconeMatch {
  id: string
  score?: number
  metadata: Record<string, unknown>
}

interface PineconeQueryResponse {
  matches: PineconeMatch[]
  namespace: string
}

export async function searchMemory(params: SearchMemoryParams): Promise<MemoryEntry[]> {
  if (!params.query || typeof params.query !== 'string') {
    throw new Error('query is required and must be a string')
  }
  if (!params.userId || typeof params.userId !== 'string') {
    throw new Error('userId is required and must be a string')
  }

  const sanitizedUserId = params.userId.trim()
  const limit = Math.max(1, Math.min(100, params.limit || 5))

  try {
    const embeddingResult = await generateEmbedding(params.query)
    
    if (embeddingResult.error || !embeddingResult.embedding) {
      console.error('Embedding generation failed:', embeddingResult.error)
      return []
    }

    const { url: pineconeUrl, apiKey: pineconeApiKey } = getPineconeConfig()

    if (pineconeUrl && pineconeApiKey) {
      const queryController = new AbortController()
      const queryTimeout = setTimeout(() => queryController.abort(), PINECONE_TIMEOUT_MS)

      try {
        const response = await fetch(`${pineconeUrl}/query`, {
          method: 'POST',
          headers: {
            'Api-Key': pineconeApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vector: embeddingResult.embedding,
            topK: limit,
            includeMetadata: true,
            filter: {
              userId: sanitizedUserId,
              ...(params.sessionId && typeof params.sessionId === 'string' && {
                sessionId: params.sessionId.trim(),
              }),
            },
          }),
          signal: queryController.signal,
        })

        clearTimeout(queryTimeout)

        if (!response.ok) {
          console.error('Pinecone query failed:', response.status)
          return []
        }

        const data: PineconeQueryResponse = await response.json()

        if (!data.matches || !Array.isArray(data.matches)) {
          return []
        }

        return data.matches.map((match: PineconeMatch) => ({
          id: match.id,
          content: (match.metadata?.content as string) || '',
          metadata: {
            userId: (match.metadata?.userId as string) || '',
            sessionId: (match.metadata?.sessionId as string) || '',
            timestamp: (match.metadata?.timestamp as string) || '',
            type: ((match.metadata?.type as string) || 'interaction') as ValidMemoryType,
            subject: match.metadata?.subject as string | undefined,
          },
        }))
      } catch (queryError) {
        clearTimeout(queryTimeout)
        console.error('Pinecone query error:', queryError)
        return []
      }
    }
  } catch (error) {
    console.error('Memory search error:', error)
  }

  return []
}

export async function getSessionMemory(sessionId: string, userId: string): Promise<MemoryEntry[]> {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new Error('sessionId is required and must be a string')
  }
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId is required and must be a string')
  }

  const sanitizedSessionId = sessionId.trim()
  const sanitizedUserId = userId.trim()

  return searchMemory({
    query: 'session memory learning',
    userId: sanitizedUserId,
    sessionId: sanitizedSessionId,
    limit: 20,
  })
}

export function buildContextPrompt(memories: MemoryEntry[]): string {
  if (!Array.isArray(memories) || memories.length === 0) {
    return ''
  }

  const validMemories = memories.filter(
    m => m && typeof m.content === 'string' && m.metadata?.type
  )

  if (validMemories.length === 0) {
    return ''
  }

  const context = validMemories
    .slice(0, 10)
    .map(m => `[${m.metadata.type}] ${m.content}`)
    .join('\n')

  return `\n\n=== Contexte de mémoire (pour référence) ===\n${context}\n=== Fin du contexte ===\n`
}

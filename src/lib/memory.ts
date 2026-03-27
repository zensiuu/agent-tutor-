import { MemoryEntry, StoreMemoryParams, SearchMemoryParams, MemoryType } from './memory-types'

// Lazy initialization to handle serverless environments where env vars may not be available at module load
function getPineconeConfig() {
  return {
    url: process.env.PINECONE_INDEX_URL,
    apiKey: process.env.PINECONE_API_KEY,
  }
}

const EMBEDDING_API_URL = process.env.GROQ_EMBEDDING_API_URL || 'https://api.groq.com/openai/v1/embeddings'
const EMBEDDING_MODEL = process.env.GROQ_EMBEDDING_MODEL || 'llama-3.3-70b-versatile'
const EMBEDDING_TIMEOUT_MS = 30000 // 30 seconds
const MAX_EMBEDDING_CHARS = 2000 // Increased from 1000 for better context
const DEFAULT_VECTOR_DIM = 768

// Allowed memory types for validation
const VALID_MEMORY_TYPES: MemoryType[] = ['interaction', 'note', 'topic', 'question']

/**
 * Generates a unique ID for memory entries
 */
function generateId(): string {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 11)
  return `mem_${timestamp}_${randomPart}`
}

/**
 * Generates an embedding vector for the given text using Groq API
 * @throws {Error} If API key is missing or request fails
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GROQ_API_KEY
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not configured for embeddings')
  }

  if (!text || typeof text !== 'string') {
    // Return a deterministic zero vector for empty/invalid input
    return new Array(DEFAULT_VECTOR_DIM).fill(0)
  }

  const truncatedText = text.slice(0, MAX_EMBEDDING_CHARS)

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
        model: EMBEDDING_MODEL,
        input: truncatedText,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      console.error('Embedding API error:', response.status, errorBody)
      throw new Error(`Embedding API request failed with status ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Invalid response format from embedding API')
    }

    const embedding = data.data[0]?.embedding
    if (!Array.isArray(embedding)) {
      throw new Error('Invalid embedding format from API')
    }

    return embedding
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Embedding request timed out after ${EMBEDDING_TIMEOUT_MS}ms`)
    }
    throw error
  }
}

/**
 * Stores a memory entry in Pinecone vector database
 * Falls back to returning the entry without embedding if Pinecone is unavailable
 */
export async function storeMemory(params: StoreMemoryParams): Promise<MemoryEntry> {
  // Validate required parameters
  if (!params.content || typeof params.content !== 'string') {
    throw new Error('content is required and must be a string')
  }
  if (!params.userId || typeof params.userId !== 'string') {
    throw new Error('userId is required and must be a string')
  }
  if (!params.sessionId || typeof params.sessionId !== 'string') {
    throw new Error('sessionId is required and must be a string')
  }

  // Validate memory type if provided
  if (params.type && !VALID_MEMORY_TYPES.includes(params.type)) {
    throw new Error(`Invalid memory type: ${params.type}. Must be one of: ${VALID_MEMORY_TYPES.join(', ')}`)
  }

  // Sanitize inputs
  const sanitizedContent = params.content.trim()
  const sanitizedUserId = params.userId.trim()
  const sanitizedSessionId = params.sessionId.trim()

  if (sanitizedContent.length === 0) {
    throw new Error('content cannot be empty')
  }

  // Truncate content if too long (Pinecone metadata limit)
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
    const embedding = await generateEmbedding(sanitizedContent)
    entry.embedding = embedding

    const { url: pineconeUrl, apiKey: pineconeApiKey } = getPineconeConfig()

    if (pineconeUrl && pineconeApiKey) {
      const upsertController = new AbortController()
      const upsertTimeout = setTimeout(() => upsertController.abort(), 10000)

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
              values: embedding,
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
          // Continue - we still have the entry in memory
        }
      } catch (upsertError) {
        clearTimeout(upsertTimeout)
        console.error('Pinecone upsert error:', upsertError)
        // Continue - we still have the entry in memory
      }
    }
  } catch (error) {
    console.error('Memory store error:', error)
    // Re-throw critical errors but still return entry
    if (error instanceof Error && error.message.includes('GROQ_API_KEY')) {
      throw error
    }
  }

  return entry
}

/**
 * Searches for relevant memories in Pinecone
 */
export async function searchMemory(params: SearchMemoryParams): Promise<MemoryEntry[]> {
  // Validate required parameters
  if (!params.query || typeof params.query !== 'string') {
    throw new Error('query is required and must be a string')
  }
  if (!params.userId || typeof params.userId !== 'string') {
    throw new Error('userId is required and must be a string')
  }

  const sanitizedUserId = params.userId.trim()
  const limit = Math.max(1, Math.min(100, params.limit || 5)) // Clamp between 1 and 100

  try {
    const queryEmbedding = await generateEmbedding(params.query)

    const { url: pineconeUrl, apiKey: pineconeApiKey } = getPineconeConfig()

    if (pineconeUrl && pineconeApiKey) {
      const queryController = new AbortController()
      const queryTimeout = setTimeout(() => queryController.abort(), 10000)

      try {
        const response = await fetch(`${pineconeUrl}/query`, {
          method: 'POST',
          headers: {
            'Api-Key': pineconeApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vector: queryEmbedding,
            topK: limit,
            includeMetadata: true,
            filter: {
              userId: sanitizedUserId,
              ...(params.sessionId && typeof params.sessionId === 'string' && { 
                sessionId: params.sessionId.trim() 
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

        const data = await response.json()
        
        if (!data.matches || !Array.isArray(data.matches)) {
          return []
        }

        return data.matches.map((match: Record<string, unknown>) => ({
          id: match.id as string,
          content: (match.metadata as Record<string, unknown>)?.content as string || '',
          metadata: {
            userId: (match.metadata as Record<string, unknown>)?.userId as string || '',
            sessionId: (match.metadata as Record<string, unknown>)?.sessionId as string || '',
            timestamp: (match.metadata as Record<string, unknown>)?.timestamp as string || '',
            type: ((match.metadata as Record<string, unknown>)?.type as MemoryType) || 'interaction',
            subject: (match.metadata as Record<string, unknown>)?.subject as string | undefined,
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
    // Return empty array for search failures - don't throw
  }

  return []
}

/**
 * Retrieves all memories for a specific session
 */
export async function getSessionMemory(sessionId: string, userId: string): Promise<MemoryEntry[]> {
  // Validate parameters
  if (!sessionId || typeof sessionId !== 'string') {
    throw new Error('sessionId is required and must be a string')
  }
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId is required and must be a string')
  }

  const sanitizedSessionId = sessionId.trim()
  const sanitizedUserId = userId.trim()

  // Use a generic session query that will match all session memories
  return searchMemory({
    query: 'session memory learning', // Generic query to retrieve session memories
    userId: sanitizedUserId,
    sessionId: sanitizedSessionId,
    limit: 20,
  })
}

/**
 * Builds a context prompt from relevant memories for the LLM
 */
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
    .slice(0, 10) // Limit to 10 most relevant memories
    .map(m => `[${m.metadata.type}] ${m.content}`)
    .join('\n')

  return `\n\n=== Contexte de mémoire (pour référence) ===\n${context}\n=== Fin du contexte ===\n`
}

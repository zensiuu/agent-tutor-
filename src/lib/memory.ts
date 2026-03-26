import { MemoryEntry, StoreMemoryParams, SearchMemoryParams } from './memory-types'

const PINECONE_URL = process.env.PINECONE_INDEX_URL
const PINECONE_API_KEY = process.env.PINECONE_API_KEY

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.groq.com/openai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      input: text.slice(0, 1000),
    }),
  })

  if (!response.ok) {
    return new Array(768).fill(0).map(() => Math.random() * 2 - 1)
  }

  const data = await response.json()
  return data.data[0].embedding
}

export async function storeMemory(params: StoreMemoryParams): Promise<MemoryEntry> {
  const entry: MemoryEntry = {
    id: generateId(),
    content: params.content,
    metadata: {
      userId: params.userId,
      sessionId: params.sessionId,
      timestamp: new Date().toISOString(),
      type: params.type,
      subject: params.subject,
    },
  }

  try {
    const embedding = await generateEmbedding(params.content)
    entry.embedding = embedding

    if (PINECONE_URL && PINECONE_API_KEY) {
      await fetch(`${PINECONE_URL}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vectors: [{
            id: entry.id,
            values: embedding,
            metadata: {
              content: params.content.slice(0, 500),
              ...entry.metadata,
            },
          }],
        }),
      })
    }
  } catch (error) {
    console.error('Pinecone store error:', error)
  }

  return entry
}

export async function searchMemory(params: SearchMemoryParams): Promise<MemoryEntry[]> {
  const limit = params.limit || 5
  
  try {
    const queryEmbedding = await generateEmbedding(params.query)

    if (PINECONE_URL && PINECONE_API_KEY) {
      const response = await fetch(`${PINECONE_URL}/query`, {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vector: queryEmbedding,
          topK: limit,
          includeMetadata: true,
          filter: {
            userId: params.userId,
            ...(params.sessionId && { sessionId: params.sessionId }),
          },
        }),
      })

      const data = await response.json()
      
      return data.matches?.map((match: any) => ({
        id: match.id,
        content: match.metadata?.content || '',
        metadata: {
          ...match.metadata,
          timestamp: match.metadata?.timestamp || '',
        },
      })) || []
    }
  } catch (error) {
    console.error('Pinecone search error:', error)
  }

  return []
}

export async function getSessionMemory(sessionId: string, userId: string): Promise<MemoryEntry[]> {
  return searchMemory({
    query: '',
    userId,
    sessionId,
    limit: 20,
  })
}

export function buildContextPrompt(memories: MemoryEntry[]): string {
  if (memories.length === 0) return ''

  const context = memories
    .map(m => `[${m.metadata.type}] ${m.content}`)
    .join('\n')

  return `\n\nContexte de mémoire (pour référence):\n${context}\n`
}

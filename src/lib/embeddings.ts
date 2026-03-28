/**
 * Embeddings Module
 * Uses Pinecone's built-in embeddings (free on serverless tier)
 * Model: multilingual-e5-small (384 dimensions)
 */

export interface EmbeddingResponse {
  embedding: number[]
  model: string
  error?: string
}

const EMBEDDING_TIMEOUT_MS = 30000
const MAX_TEXT_LENGTH = 500
const VECTOR_DIMENSIONS = 384

export async function generateEmbedding(text: string): Promise<EmbeddingResponse> {
  const truncatedText = text.slice(0, MAX_TEXT_LENGTH)

  try {
    const response = await fetch('https://api.pinecone.io/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.PINECONE_API_KEY || '',
      },
      body: JSON.stringify({
        model: 'multilingual-e5-small',
        inputs: [truncatedText],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      console.error('Pinecone embeddings error:', response.status, errorBody)
      return {
        embedding: new Array(VECTOR_DIMENSIONS).fill(0),
        model: 'none',
        error: `Embedding API failed: ${response.status}`,
      }
    }

    const data = await response.json()
    const embedding = data.data?.[0]?.values

    if (!embedding || !Array.isArray(embedding)) {
      return {
        embedding: new Array(VECTOR_DIMENSIONS).fill(0),
        model: 'none',
        error: 'Invalid embedding response',
      }
    }

    return {
      embedding,
      model: 'multilingual-e5-small',
    }
  } catch (error) {
    console.error('Embedding generation error:', error)
    return {
      embedding: new Array(VECTOR_DIMENSIONS).fill(0),
      model: 'none',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function getEmbeddingDimensions(): number {
  return VECTOR_DIMENSIONS
}

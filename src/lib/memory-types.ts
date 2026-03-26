export interface MemoryEntry {
  id: string
  content: string
  embedding?: number[]
  metadata: {
    userId: string
    sessionId: string
    timestamp: string
    type: 'interaction' | 'note' | 'topic' | 'question'
    subject?: string
  }
}

export interface MemoryContext {
  relevantMemories: MemoryEntry[]
  sessionHistory: MemoryEntry[]
}

export interface StoreMemoryParams {
  content: string
  userId: string
  sessionId: string
  type: MemoryEntry['metadata']['type']
  subject?: string
}

export interface SearchMemoryParams {
  query: string
  userId: string
  sessionId?: string
  limit?: number
}

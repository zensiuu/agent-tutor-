// Export the memory type union for use in other modules
export type MemoryType = 'interaction' | 'note' | 'topic' | 'question'

export interface MemoryMetadata {
  userId: string
  sessionId: string
  timestamp: string
  type: MemoryType
  subject?: string
}

export interface MemoryEntry {
  id: string
  content: string
  embedding?: number[]
  metadata: MemoryMetadata
}

export interface MemoryContext {
  relevantMemories: MemoryEntry[]
  sessionHistory: MemoryEntry[]
}

export interface StoreMemoryParams {
  content: string
  userId: string
  sessionId: string
  type?: MemoryType
  subject?: string
}

export interface SearchMemoryParams {
  query: string
  userId: string
  sessionId?: string
  limit?: number
}

// Validation helpers
export const VALID_MEMORY_TYPES: readonly MemoryType[] = ['interaction', 'note', 'topic', 'question'] as const

export function isValidMemoryType(type: string): type is MemoryType {
  return VALID_MEMORY_TYPES.includes(type as MemoryType)
}

export function isValidMemoryEntry(entry: unknown): entry is MemoryEntry {
  if (!entry || typeof entry !== 'object') return false
  const e = entry as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.content === 'string' &&
    typeof e.metadata === 'object' &&
    e.metadata !== null
  )
}

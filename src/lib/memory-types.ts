/**
 * Memory Types Module
 * Re-exports from centralized types for backwards compatibility
 * New code should import from @/lib/types directly
 */

// Re-export all memory-related types
export type {
  MemoryType,
  MemoryMetadata,
  MemoryEntry,
  MemoryContext,
  StoreMemoryParams,
  SearchMemoryParams,
  ValidMemoryType,
  StoreMemoryResponse,
  SearchMemoryResponse,
  SanitizedMemoryEntry,
} from './types'

// Re-export constants and validators
export { VALID_MEMORY_TYPES } from './types'
export { isValidMemoryType } from './types'

/**
 * @deprecated Import ValidMemoryType from '@/lib/types' instead
 */
export type LegacyMemoryType = 'interaction' | 'note' | 'topic' | 'question'

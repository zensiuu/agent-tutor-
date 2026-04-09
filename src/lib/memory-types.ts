/**
 * Memory Types Module
 * Re-exports from centralized types for backwards compatibility
 * New code should import from @/types/types directly
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
} from '../types/types'

// Re-export constants and validators
export { VALID_MEMORY_TYPES } from '../types/types'
export { isValidMemoryType } from '../types/types'

/**
 * @deprecated Import ValidMemoryType from '@/types/types' instead
 */
export type LegacyMemoryType = 'interaction' | 'note' | 'topic' | 'question'

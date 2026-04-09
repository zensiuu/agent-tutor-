/**
 * Unified Type Definitions for Tunisian Tutor
 * Central source of truth for all shared types
 */

// =============================================================================
// Chat Types
// =============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface Message extends ChatMessage {
  id: string
  timestamp: Date
}

export interface ChatRequest {
  message: string
  history?: ChatMessage[]
  userId?: string
  sessionId?: string
}

export interface ChatResponse {
  response: string
  memories?: number
  error?: string
}

// =============================================================================
// Memory Types
// =============================================================================

export type MemoryType = 'interaction' | 'note' | 'topic' | 'question'

export const VALID_MEMORY_TYPES = ['interaction', 'note', 'topic', 'question'] as const
export type ValidMemoryType = (typeof VALID_MEMORY_TYPES)[number]

export function isValidMemoryType(type: string): type is ValidMemoryType {
  return VALID_MEMORY_TYPES.includes(type as ValidMemoryType)
}

export interface MemoryMetadata {
  userId: string
  sessionId: string
  timestamp: string
  type: ValidMemoryType
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
  type?: ValidMemoryType
  subject?: string
}

export interface SearchMemoryParams {
  query: string
  userId: string
  sessionId?: string
  limit?: number
}

export interface StoreMemoryResponse {
  success: boolean
  entry?: {
    id: string
    content: string
    metadata: unknown
  }
  error?: string
}

export interface SearchMemoryResponse {
  memories: SanitizedMemoryEntry[]
  error?: string
  query?: string
}

export interface SanitizedMemoryEntry {
  id: string
  content: string
  metadata: {
    userId: string
    sessionId: string
    timestamp: string
    type: ValidMemoryType
    subject?: string
  }
}

// =============================================================================
// Voice Types
// =============================================================================

export interface VoiceRequest {
  transcript?: string
  error?: string
}

export interface TranscriptionResult {
  transcript: string
  confidence?: number
  error?: string
}

// =============================================================================
// Search Types
// =============================================================================

export interface SearchRequest {
  query: string
}

export interface SearchResponse {
  success: boolean
  data?: unknown
  error?: string
  query?: string
}

export interface TinyFishResult {
  success: boolean
  data?: unknown
  error?: string
}

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

// =============================================================================
// Subject Types
// =============================================================================

export type SubjectId = 'algorithms' | 'databases' | 'tic' | 'mathematics' | 'physics'

export interface SubjectDefinition {
  id: SubjectId
  name: string
  nameAr: string
  topics: string[]
}

export function isValidSubjectId(id: string): id is SubjectId {
  const validIds: SubjectId[] = ['algorithms', 'databases', 'tic', 'mathematics', 'physics']
  return validIds.includes(id as SubjectId)
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function createErrorResponse(
  error: string,
  code?: string
): ApiErrorResponse {
  return {
    success: false,
    error,
    ...(code && { code }),
  }
}

// =============================================================================
// Session Types
// =============================================================================

export interface Session {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  subject?: string
}

// =============================================================================
// User Types
// =============================================================================

export interface User {
  id: string
  createdAt: string
  preferences: UserPreferences
}

export interface UserPreferences {
  language: 'fr' | 'ar' | 'both'
  defaultSubject?: SubjectId
}

// =============================================================================
// Utility Types
// =============================================================================

export interface Tool {
  name: string
  description: string
  enabled: boolean
}

export interface AgentState {
  messages: Message[]
  isProcessing: boolean
  currentTool: string | null
}

// =============================================================================
// Validation Constants
// =============================================================================

export const VALIDATION_LIMITS = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_HISTORY_LENGTH: 50,
  MAX_USER_ID_LENGTH: 100,
  MAX_SESSION_ID_LENGTH: 100,
  MAX_CONTENT_LENGTH: 50000,
  MAX_QUERY_LENGTH: 5000,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 5,
} as const

export const TIMEOUT_MS = {
  DEFAULT: 30000,
  LONG_RUNNING: 60000,
  VOICE: 30000,
  SEARCH: 90000,
  EMBEDDING: 30000,
  PINECONE: 10000,
} as const

export const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/m4a',
  'audio/flac',
  'audio/aac',
] as const

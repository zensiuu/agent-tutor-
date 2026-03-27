export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export interface Subject {
  id: string
  name: string
  nameAr: string
  topics: string[]
}

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

// API Response types for consistent error handling
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

// Session types
export interface Session {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  subject?: string
}

// User types (for future authentication)
export interface User {
  id: string
  createdAt: string
  preferences: UserPreferences
}

export interface UserPreferences {
  language: 'fr' | 'ar' | 'both'
  defaultSubject?: string
}

// Utility type for creating standardized error responses
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

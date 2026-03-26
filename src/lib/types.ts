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

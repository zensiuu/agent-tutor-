'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { Message, ChatMessage } from '@/lib/types'

// =============================================================================
// Session & User ID Management
// =============================================================================

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function getUserId(): string {
  if (typeof window === 'undefined') return 'default'
  let userId = localStorage.getItem('tutor_user_id')
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('tutor_user_id', userId)
  }
  return userId
}

// =============================================================================
// Initial Welcome Message
// =============================================================================

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'مرحبا! أنا tutor الخاص بك 🇹🇳\n\nBonjour! Je suis votre tuteur personnel pour le Bac.\n\nChoisissez une matière et posez-moi vos questions!',
  timestamp: new Date(),
}

// =============================================================================
// Chat Interface Component
// =============================================================================

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(generateSessionId)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  /**
   * Sends a message to the chat API
   */
  const sendMessage = useCallback(async (messageText: string, messageHistory?: Message[]) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setError(null)
    setIsLoading(true)

    try {
      const historyForApi: ChatMessage[] = (messageHistory || messages)
        .slice(-10) // Only send last 10 messages
        .map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: historyForApi,
          userId: getUserId(),
          sessionId,
        }),
        signal: abortControllerRef.current.signal,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      return data.response as string
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null // Request was cancelled, don't show error
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [messages, sessionId])

  /**
   * Handles sending a message
   */
  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    }

    // Optimistically add user message
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await sendMessage(trimmedInput, messages)
      
      if (response) {
        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      
      // Add error message from assistant
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Désolé, il y a une erreur de connexion. Réessayez.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }, [input, isLoading, messages, sendMessage])

  /**
   * Handles voice transcript from VoiceInput
   */
  const handleTranscript = useCallback((transcript: string) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript)
    inputRef.current?.focus()
  }, [])

  /**
   * Handles keyboard shortcuts
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  /**
   * Cancels the current request
   */
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }, [])

  // Memoize message rendering
  const messageElements = useMemo(() => (
    messages.map(message => (
      <div
        key={message.id}
        className={`chat-bubble flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            message.role === 'user'
              ? 'bg-indigo-600 text-white'
              : message.role === 'system'
              ? 'bg-slate-700 text-slate-300 text-sm italic'
              : 'bg-slate-800 text-slate-100'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          <span className="text-xs opacity-60 mt-1 block">
            {message.timestamp.toLocaleTimeString('fr-TN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    ))
  ), [messages])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageElements}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-4 py-3">
              <div className="flex gap-2 items-center">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-900/30 border-t border-red-800/50">
          <div className="flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-400"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question... / اكتب سؤالك هنا..."
            aria-label="Zone de texte pour poser une question"
            disabled={isLoading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          />
          
          {isLoading ? (
            <button
              onClick={handleCancel}
              aria-label="Annuler la requête"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Envoyer le message"
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Character count (when typing) */}
        {input.length > 0 && (
          <p className="text-xs text-slate-500 mt-1 text-right">
            {input.length} / 10000
          </p>
        )}
      </div>
    </div>
  )
}

// Export the VoiceInput integration helper
export { VoiceInput } from '@/components/voice/voice-input'

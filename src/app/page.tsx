'use client'

import { ChatInterface, VoiceInput } from '@/components/chat/chat-interface'
import { Workspace } from '@/components/workspace/workspace'
import { useState, useCallback } from 'react'

export default function Home() {
  const [voiceTranscript, setVoiceTranscript] = useState<string>('')

  const handleTranscript = useCallback((transcript: string) => {
    setVoiceTranscript(transcript)
    // The transcript will be picked up by the chat interface
    // through the input state management
  }, [])

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Chat + Voice */}
      <div className="flex-1 flex flex-col h-screen lg:h-auto">
        <header className="p-4 border-b border-slate-700/50">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Tunisian Tutor
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Bac Info/Math • Français • العربية</p>
        </header>

        <ChatInterface />

        <VoiceInput onTranscript={handleTranscript} />
      </div>

      {/* Right: Workspace */}
      <div className="hidden lg:block w-80 border-l border-slate-700/50 h-screen overflow-y-auto">
        <Workspace />
      </div>
    </main>
  )
}

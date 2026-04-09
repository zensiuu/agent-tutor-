'use client'

import { ChatInterface, VoiceInput } from '@/components/chat/chat-interface'
import { Workspace } from '@/components/workspace/workspace'
import { useState, useCallback } from 'react'
import { type SubjectId } from '@/lib/subjects'

// =============================================================================
// Menu Icon Component
// =============================================================================

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export default function Home() {
  const [voiceTranscript, setVoiceTranscript] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const handleTranscript = useCallback((transcript: string) => {
    setVoiceTranscript(transcript)
  }, [])

  const handleSubjectSelect = useCallback((subjectId: SubjectId, topic?: string) => {
    setSelectedSubject(subjectId)
    if (topic) {
      setSelectedTopic(topic)
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  // Get the subject name for the header
  const getSubjectDisplayName = () => {
    if (selectedSubject) {
      const subjectNames: Record<SubjectId, string> = {
        algorithms: 'Algorithmes et Programmation',
        databases: 'Bases de Données',
        tic: 'TIC',
        mathematics: 'Mathématiques',
        physics: 'Physique',
      }
      return subjectNames[selectedSubject] || 'Tunisian Tutor'
    }
    return 'Tunisian Tutor'
  }

  return (
    <main className="min-h-screen flex">
      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } h-screen flex-shrink-0 bg-slate-900 border-r border-slate-700/50 overflow-hidden transition-all duration-300`}
      >
        <Workspace onSubjectSelect={handleSubjectSelect} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header with sidebar toggle */}
        <header className="flex items-center gap-3 p-4 border-b border-slate-700/50 bg-slate-900/50">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <MenuIcon />
          </button>
          
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#0D9373] to-emerald-400 bg-clip-text text-transparent">
              {getSubjectDisplayName()}
            </h1>
            <p className="text-xs text-slate-500">
              {selectedTopic ? `Sujet: ${selectedTopic}` : 'Bac Info/Math • Français • العربية'}
            </p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface 
            subjectId={selectedSubject} 
            topic={selectedTopic}
          />
          <VoiceInput onTranscript={handleTranscript} />
        </div>
      </div>
    </main>
  )
}

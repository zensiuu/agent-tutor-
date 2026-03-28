'use client'

import { useState, useCallback } from 'react'
import { BAC_SUBJECTS, type SubjectId } from '@/lib/subjects'

// =============================================================================
// SVG Icon Components
// =============================================================================

const NotesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const DrawIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)

const PdfIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
)

const FilesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// =============================================================================
// Tool Types
// =============================================================================

type ActiveTool = 'notes' | 'draw' | 'pdf' | 'files' | 'search' | null

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  ariaLabel: string
  isActive?: boolean
  onClick: () => void
}

function ToolButton({ icon, label, ariaLabel, isActive = false, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-95 cursor-pointer ${
        isActive
          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50'
          : 'bg-slate-800 hover:bg-slate-700 hover:ring-2 hover:ring-indigo-500/50 text-slate-300'
      }`}
      aria-label={ariaLabel}
      aria-pressed={isActive}
    >
      <span className={`flex justify-center ${isActive ? 'text-white' : 'text-indigo-400'}`}>
        {icon}
      </span>
      <p className="text-xs mt-1">{label}</p>
    </button>
  )
}

// =============================================================================
// Tool Panels
// =============================================================================

interface NotesPanelProps {
  onClose: () => void
}

function NotesPanel({ onClose }: NotesPanelProps) {
  const [note, setNote] = useState('')

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-slate-200">Mes Notes</h4>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-400" aria-label="Fermer">
          <CloseIcon />
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Écrivez vos notes ici..."
        className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        aria-label="Zone de prise de notes"
      />
      <p className="text-xs text-slate-500">
        {note.length} caractères
      </p>
    </div>
  )
}

interface SearchPanelProps {
  onClose: () => void
}

function SearchPanel({ onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<unknown[]>([])

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return

    setIsSearching(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await response.json()
      if (data.success) {
        setResults(data.data ? [data.data] : [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-slate-200">Recherche Web</h4>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-400" aria-label="Fermer">
          <CloseIcon />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Rechercher sur le web..."
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Zone de recherche"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
          aria-label="Lancer la recherche"
        >
          <SearchIcon />
        </button>
      </div>
      {results.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-300 max-h-48 overflow-y-auto">
          {results.map((result, i) => (
            <div key={i} className="py-2 border-b border-slate-700 last:border-0">
              {typeof result === 'string' ? result : JSON.stringify(result)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface DrawingPanelProps {
  onClose: () => void
}

function DrawingPanel({ onClose }: DrawingPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-slate-200">Tableau Blanc</h4>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-400" aria-label="Fermer">
          <CloseIcon />
        </button>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg h-48 flex items-center justify-center">
        <p className="text-slate-500 text-sm">
          Tableau de dessin - À venir
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// Workspace Component
// =============================================================================

export function Workspace() {
  const [activeSubject, setActiveSubject] = useState<SubjectId | null>(null)
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)

  const handleToolClick = useCallback((tool: ActiveTool) => {
    setActiveTool(prev => prev === tool ? null : tool)
  }, [])

  const closeToolPanel = useCallback(() => {
    setActiveTool(null)
  }, [])

  const handleTopicClick = useCallback((topic: string) => {
    // This could be integrated with the chat to search for the topic
    console.log('Topic clicked:', topic)
  }, [])

  return (
    <div className="p-4 space-y-6">
      {/* Subjects Section */}
      <div>
        <h2 className="text-base font-semibold text-slate-200 mb-3">Matières</h2>

        <div className="space-y-2">
          {Object.values(BAC_SUBJECTS).map(subject => (
            <button
              key={subject.id}
              onClick={() => setActiveSubject(prev => prev === subject.id ? null : subject.id as SubjectId)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 focus:ring-offset-slate-900 cursor-pointer ${
                activeSubject === subject.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <p className="font-medium text-sm">{subject.name}</p>
              <p className="text-xs opacity-70" dir="rtl">{subject.nameAr}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Topics Section (when subject selected) */}
      {activeSubject && (
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Sujets - {BAC_SUBJECTS[activeSubject].name}
          </h3>
          <div className="space-y-1.5">
            {BAC_SUBJECTS[activeSubject].topics.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleTopicClick(topic)}
                className="w-full text-left text-sm p-2.5 bg-slate-800/50 rounded-lg text-slate-300 hover:bg-slate-700/70 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tools Section */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Outils</h3>
        <div className="grid grid-cols-2 gap-2">
          <ToolButton
            icon={<NotesIcon />}
            label="Notes"
            ariaLabel="Outil de prise de notes"
            isActive={activeTool === 'notes'}
            onClick={() => handleToolClick('notes')}
          />
          <ToolButton
            icon={<DrawIcon />}
            label="Dessin"
            ariaLabel="Outil de dessin"
            isActive={activeTool === 'draw'}
            onClick={() => handleToolClick('draw')}
          />
          <ToolButton
            icon={<PdfIcon />}
            label="PDF"
            ariaLabel="Gestionnaire de fichiers PDF"
            isActive={activeTool === 'pdf'}
            onClick={() => handleToolClick('pdf')}
          />
          <ToolButton
            icon={<FilesIcon />}
            label="Fichiers"
            ariaLabel="Gestionnaire de fichiers"
            isActive={activeTool === 'files'}
            onClick={() => handleToolClick('files')}
          />
        </div>

        {/* Search Button */}
        <div className="mt-2">
          <ToolButton
            icon={<SearchIcon />}
            label="Recherche Web"
            ariaLabel="Recherche sur internet"
            isActive={activeTool === 'search'}
            onClick={() => handleToolClick('search')}
          />
        </div>
      </div>

      {/* Active Tool Panel */}
      {activeTool === 'notes' && <NotesPanel onClose={closeToolPanel} />}
      {activeTool === 'draw' && <DrawingPanel onClose={closeToolPanel} />}
      {activeTool === 'search' && <SearchPanel onClose={closeToolPanel} />}

      {/* Placeholder panels for unimplemented tools */}
      {activeTool === 'pdf' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-slate-200">Gestionnaire PDF</h4>
            <button onClick={closeToolPanel} className="text-slate-500 hover:text-slate-400">
              <CloseIcon />
            </button>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
            <p className="text-slate-500 text-sm">
              Importez vos PDFs pour les étudier
            </p>
            <p className="text-slate-600 text-xs mt-2">
              Fonctionnalité à venir
            </p>
          </div>
        </div>
      )}

      {activeTool === 'files' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-slate-200">Mes Fichiers</h4>
            <button onClick={closeToolPanel} className="text-slate-500 hover:text-slate-400">
              <CloseIcon />
            </button>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
            <p className="text-slate-500 text-sm">
              Gérez vos fichiers et documents
            </p>
            <p className="text-slate-600 text-xs mt-2">
              Fonctionnalité à venir
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

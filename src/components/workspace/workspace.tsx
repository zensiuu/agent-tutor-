'use client'

import { useState, useCallback } from 'react'
import { BAC_SUBJECTS, type SubjectId } from '@/lib/subjects'

// =============================================================================
// Tab Types
// =============================================================================

type TabId = 'subjects' | 'devoirat' | 'calendar' | 'settings' | 'notes'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  {
    id: 'subjects',
    label: 'SUBJECTS',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'devoirat',
    label: 'DEVOIRAT',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'CALENDRAR',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'SETTINGS',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'notes',
    label: 'NOTES',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
]

// =============================================================================
// SVG Icon Components
// =============================================================================

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ChevronIcon = ({ direction }: { direction: 'down' | 'right' }) => (
  <svg 
    className={`w-4 h-4 transition-transform duration-200 ${direction === 'down' ? 'rotate-180' : ''}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const NotesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

// =============================================================================
// Calendar Component
// =============================================================================

interface CalendarEvent {
  date: number
  title: string
  subject?: SubjectId
}

interface CalendarProps {
  onClose?: () => void
}

function Calendar({ onClose }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([
    { date: 15, title: 'Devoir Maths', subject: 'mathematics' },
    { date: 20, title: 'Examen Algo', subject: 'algorithms' },
  ])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const hasEvent = (day: number) => {
    return events.some(e => e.date === day)
  }

  const getEventForDay = (day: number) => {
    return events.find(e => e.date === day)
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(day)
  }

  const renderDays = () => {
    const days = []
    
    // Empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day calendar-day-empty" />)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate === day
      const isTodayDate = isToday(day)
      const hasEventDate = hasEvent(day)
      const event = getEventForDay(day)
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`calendar-day relative ${
            isSelected ? 'selected' : isTodayDate ? 'today' : 'hover:bg-slate-700'
          }`}
        >
          {day}
          {hasEventDate && !isSelected && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0D9373]" />
          )}
        </button>
      )
    }
    
    return days
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-200">
          {monthNames[month]} {year}
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-400" aria-label="Fermer">
            <CloseIcon />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={prevMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
        >
          <ChevronIcon direction="right" />
        </button>
        <span className="text-sm font-medium text-slate-300">{monthNames[month]} {year}</span>
        <button 
          onClick={nextMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
        >
          <ChevronIcon direction="down" />
        </button>
      </div>
      
      {/* Day names */}
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="calendar-grid">
        {renderDays()}
      </div>
      
      {/* Selected date events */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-slate-300 mb-2">
            {selectedDate} {monthNames[month]}
          </h4>
          {events.filter(e => e.date === selectedDate).length > 0 ? (
            <div className="space-y-2">
              {events.filter(e => e.date === selectedDate).map((event, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#0D9373]" />
                  <span className="text-slate-300">{event.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Aucun événement</p>
          )}
        </div>
      )}
      
      {/* Add event button */}
      <button className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
        <PlusIcon />
        <span className="text-sm font-medium">Ajouter un événement</span>
      </button>
    </div>
  )
}

// =============================================================================
// Notes Panel Component
// =============================================================================

interface NotesPanelProps {
  onClose: () => void
}

function NotesPanel({ onClose }: NotesPanelProps) {
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<{ id: number; title: string; content: string; date: string }[]>([
    { id: 1, title: 'Notes Algo', content: 'Variables, types, conditionnelles...', date: '2024-01-15' },
    { id: 2, title: 'Formules Maths', content: 'Formules d\'intégration', date: '2024-01-14' },
  ])

  const handleSave = () => {
    if (note.trim()) {
      const newNote = {
        id: Date.now(),
        title: `Note ${notes.length + 1}`,
        content: note,
        date: new Date().toISOString().split('T')[0]
      }
      setNotes([newNote, ...notes])
      setNote('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-200">Mes Notes</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-400" aria-label="Fermer">
          <CloseIcon />
        </button>
      </div>
      
      {/* Add new note */}
      <div className="space-y-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Écrivez une nouvelle note..."
          className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9373] resize-none"
          aria-label="Zone de prise de notes"
        />
        <button 
          onClick={handleSave}
          disabled={!note.trim()}
          className="w-full bg-[#0D9373] hover:bg-[#059669] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          Sauvegarder
        </button>
      </div>
      
      {/* Notes list */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-400">Notes existantes</h4>
        {notes.map(n => (
          <div key={n.id} className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h5 className="text-sm font-medium text-slate-200">{n.title}</h5>
              <span className="text-xs text-slate-500">{n.date}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Devoirat Panel Component
// =============================================================================

interface DevoiratPanelProps {
  onClose: () => void
}

function DevoiratPanel({ onClose }: DevoiratPanelProps) {
  const [devoirs, setDevoirs] = useState([
    { id: 1, title: 'Exercice Algo - Chapitre 3', subject: 'algorithms', dueDate: '2024-01-20', status: 'pending' },
    { id: 2, title: 'Devoir Maths - Nombres complexes', subject: 'mathematics', dueDate: '2024-01-22', status: 'pending' },
    { id: 3, title: 'TD Physique - Électricité', subject: 'physics', dueDate: '2024-01-18', status: 'completed' },
  ])

  const getSubjectName = (id: SubjectId) => BAC_SUBJECTS[id]?.name || id

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-200">Mes Devoirs</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-400" aria-label="Fermer">
          <CloseIcon />
        </button>
      </div>
      
      {/* Add devoir button */}
      <button className="w-full flex items-center justify-center gap-2 p-3 bg-[#0D9373]/20 hover:bg-[#0D9373]/30 border border-[#0D9373]/50 rounded-lg text-[#0D9373] transition-colors">
        <PlusIcon />
        <span className="text-sm font-medium">Ajouter un devoir</span>
      </button>
      
      {/* Devoirs list */}
      <div className="space-y-2">
        {devoirs.map(devoir => (
          <div 
            key={devoir.id} 
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              devoir.status === 'completed' 
                ? 'bg-slate-800/30 border-slate-700/50 opacity-60' 
                : 'bg-slate-800/50 border-slate-700 hover:border-[#0D9373]/50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h5 className="text-sm font-medium text-slate-200">{devoir.title}</h5>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                devoir.status === 'completed' 
                  ? 'bg-green-900/50 text-green-400' 
                  : 'bg-amber-900/50 text-amber-400'
              }`}>
                {devoir.status === 'completed' ? 'Terminé' : 'En cours'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {getSubjectName(devoir.subject as SubjectId)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {devoir.dueDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Settings Panel Component
// =============================================================================

interface SettingsPanelProps {
  onClose: () => void
}

function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [language, setLanguage] = useState('fr')
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-200">Paramètres</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-400" aria-label="Fermer">
          <CloseIcon />
        </button>
      </div>
      
      {/* Language setting */}
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-200">Langue / اللغة</p>
            <p className="text-xs text-slate-400">Langue de l'interface</p>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0D9373]"
          >
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="mixed">Français + العربية</option>
          </select>
        </div>
      </div>
      
      {/* Notifications setting */}
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-200">Notifications</p>
            <p className="text-xs text-slate-400">Rappels et alertes</p>
          </div>
          <button 
            onClick={() => setNotifications(!notifications)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              notifications ? 'bg-[#0D9373]' : 'bg-slate-600'
            }`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              notifications ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
      </div>
      
      {/* Appearance setting */}
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-200">Apparence</p>
            <p className="text-xs text-slate-400">Thème sombre (actif)</p>
          </div>
          <button className="text-slate-400 hover:text-slate-200">
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
      
      {/* About */}
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-200">À propos</p>
            <p className="text-xs text-slate-400">Version 1.0.0</p>
          </div>
          <button className="text-slate-400 hover:text-slate-200">
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Subject List Item Component
// =============================================================================

interface SubjectListItemProps {
  subject: {
    id: SubjectId
    name: string
    nameAr: string
    topics: string[]
  }
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onSelectTopic: (topic: string) => void
}

function SubjectListItem({ subject, isExpanded, isSelected, onToggle, onSelectTopic }: SubjectListItemProps) {
  return (
    <div className="border-b border-slate-700/50 last:border-b-0">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 text-left transition-all duration-200 hover:bg-slate-800/50 ${
          isSelected ? 'bg-[#0D9373]/20 border-l-2 border-l-[#0D9373]' : ''
        }`}
        aria-expanded={isExpanded}
      >
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200">{subject.name}</p>
          <p className="text-xs text-slate-500" dir="rtl">{subject.nameAr}</p>
        </div>
        <ChevronIcon direction={isExpanded ? 'down' : 'right'} />
      </button>
      
      {/* Expandable topics */}
      <div className={`expand-collapse ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="pb-2 px-3 space-y-1">
          {subject.topics.map((topic, i) => (
            <button
              key={i}
              onClick={() => onSelectTopic(topic)}
              className="w-full text-left text-xs p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Workspace Component
// =============================================================================

interface WorkspaceProps {
  onSubjectSelect?: (subjectId: SubjectId, topic?: string) => void
}

export function Workspace({ onSubjectSelect }: WorkspaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('subjects')
  const [expandedSubjects, setExpandedSubjects] = useState<Set<SubjectId>>(new Set())
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null)

  const toggleSubject = useCallback((subjectId: SubjectId) => {
    setExpandedSubjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId)
      } else {
        newSet.add(subjectId)
      }
      return newSet
    })
  }, [])

  const handleTopicSelect = useCallback((subjectId: SubjectId, topic: string) => {
    setSelectedSubject(subjectId)
    onSubjectSelect?.(subjectId, topic)
  }, [onSubjectSelect])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'subjects':
        return (
          <div className="space-y-1">
            {Object.values(BAC_SUBJECTS).map(subject => (
              <SubjectListItem
                key={subject.id}
                subject={subject}
                isExpanded={expandedSubjects.has(subject.id)}
                isSelected={selectedSubject === subject.id}
                onToggle={() => toggleSubject(subject.id)}
                onSelectTopic={(topic) => handleTopicSelect(subject.id, topic)}
              />
            ))}
          </div>
        )
      
      case 'devoirat':
        return <DevoiratPanel onClose={() => {}} />
      
      case 'calendar':
        return <Calendar onClose={() => {}} />
      
      case 'settings':
        return <SettingsPanel onClose={() => {}} />
      
      case 'notes':
        return <NotesPanel onClose={() => {}} />
      
      default:
        return null
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar Toggle Button (visible when collapsed) */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors shadow-lg"
          aria-label="Ouvrir le menu"
        >
          <MenuIcon />
        </button>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-72' : 'w-0'} h-screen flex-shrink-0 bg-slate-900 border-r border-slate-700/50 overflow-hidden sidebar-transition`}
      >
        <div className="h-full flex flex-col w-72">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div>
              <h1 className="text-lg font-bold text-slate-200">Tunisian Tutor</h1>
              <p className="text-xs text-slate-500">Bac Info/Math</p>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Fermer le menu"
            >
              <CloseIcon />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b border-slate-700/50">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[calc(100%/5)] p-2 flex flex-col items-center gap-1 text-xs font-medium transition-all duration-200 border-b-2 focus:outline-none ${
                  activeTab === tab.id
                    ? 'text-[#0D9373] border-[#0D9373] bg-slate-800/30'
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/20'
                }`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.icon}
                <span className="truncate text-[10px]">{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

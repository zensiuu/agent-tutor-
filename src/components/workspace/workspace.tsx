'use client'

import { useState } from 'react'
import { BAC_SUBJECTS } from '@/lib/subjects'

export function Workspace() {
  const [activeSubject, setActiveSubject] = useState<string | null>(null)

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Matières</h2>
      
      <div className="space-y-2 mb-6">
        {Object.values(BAC_SUBJECTS).map(subject => (
          <button
            key={subject.id}
            onClick={() => setActiveSubject(activeSubject === subject.id ? null : subject.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              activeSubject === subject.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <p className="font-medium text-sm">{subject.name}</p>
            <p className="text-xs opacity-70" dir="rtl">{subject.nameAr}</p>
          </button>
        ))}
      </div>

      {activeSubject && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Topics</h3>
          <div className="space-y-1">
            {BAC_SUBJECTS[activeSubject as keyof typeof BAC_SUBJECTS].topics.map((topic, i) => (
              <div
                key={i}
                className="text-sm p-2 bg-slate-800/50 rounded text-slate-300 hover:bg-slate-700/50 cursor-pointer"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Outils</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-3 bg-slate-800 rounded-lg text-center hover:bg-slate-700">
            <span className="text-xl">📝</span>
            <p className="text-xs mt-1">Notes</p>
          </button>
          <button className="p-3 bg-slate-800 rounded-lg text-center hover:bg-slate-700">
            <span className="text-xl">🎨</span>
            <p className="text-xs mt-1">Dessin</p>
          </button>
          <button className="p-3 bg-slate-800 rounded-lg text-center hover:bg-slate-700">
            <span className="text-xl">📄</span>
            <p className="text-xs mt-1">PDF</p>
          </button>
          <button className="p-3 bg-slate-800 rounded-lg text-center hover:bg-slate-700">
            <span className="text-xl">📁</span>
            <p className="text-xs mt-1">Fichiers</p>
          </button>
        </div>
      </div>
    </div>
  )
}

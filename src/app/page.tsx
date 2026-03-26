import { ChatInterface } from '@/components/chat/chat-interface'
import { VoiceInput } from '@/components/voice/voice-input'
import { Workspace } from '@/components/workspace/workspace'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Chat + Voice */}
      <div className="flex-1 flex flex-col h-screen lg:h-auto">
        <header className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Tunisian Tutor
          </h1>
          <p className="text-xs text-slate-400">Bac Info/Math • Français • العربية</p>
        </header>
        
        <ChatInterface />
        
        <VoiceInput />
      </div>

      {/* Right: Workspace */}
      <div className="hidden lg:block w-80 border-l border-slate-800 h-screen overflow-y-auto">
        <Workspace />
      </div>
    </main>
  )
}

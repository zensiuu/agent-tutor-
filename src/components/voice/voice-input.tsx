'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceInputProps {
  onTranscript?: (transcript: string) => void
  disabled?: boolean
}

interface TranscriptionState {
  isRecording: boolean
  isProcessing: boolean
  error: string | null
  transcript: string | null
}

const MAX_RECORDING_DURATION_MS = 60000 // 1 minute max recording

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [state, setState] = useState<TranscriptionState>({
    isRecording: false,
    isProcessing: false,
    error: null,
    transcript: null,
  })
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
    }
    setState(prev => ({ ...prev, isRecording: false }))
  }, [])

  const sendToDeepgram = async (audioBlob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return data.transcript || null
    } catch (error) {
      console.error('Transcription error:', error)
      throw error
    }
  }

  const startRecording = async () => {
    try {
      setState(prev => ({ ...prev, error: null, transcript: null }))

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      })
      
      streamRef.current = stream
      chunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setState(prev => ({ ...prev, isProcessing: true }))
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        try {
          const transcript = await sendToDeepgram(audioBlob)
          
          setState(prev => ({ 
            ...prev, 
            isProcessing: false,
            transcript: transcript || '[Aucune parole détectée]',
          }))

          if (transcript && onTranscript) {
            onTranscript(transcript)
          }
        } catch (error) {
          setState(prev => ({ 
            ...prev, 
            isProcessing: false,
            error: error instanceof Error ? error.message : 'Transcription failed',
          }))
        }
      }

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e)
        setState(prev => ({ 
          ...prev, 
          isRecording: false,
          error: 'Recording error occurred',
        }))
      }

      mediaRecorder.start()
      setState(prev => ({ ...prev, isRecording: true }))

      // Set max recording duration timeout
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording()
        setState(prev => ({ 
          ...prev, 
          error: 'Maximum recording duration reached',
        }))
      }, MAX_RECORDING_DURATION_MS)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      
      let errorMessage = 'Impossible d\'accéder au microphone'
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Permission microphone refusée. Veuillez autoriser l\'accès.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Aucun microphone trouvé sur cet appareil.'
        }
      }
      
      setState(prev => ({ ...prev, error: errorMessage }))
    }
  }

  const handleClick = () => {
    if (disabled || state.isProcessing) return
    
    if (state.isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const clearTranscript = () => {
    setState(prev => ({ ...prev, transcript: null, error: null }))
  }

  return (
    <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleClick}
          disabled={disabled || state.isProcessing}
          aria-label={state.isRecording ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement vocal'}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            state.isRecording
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400 animate-pulse'
              : state.isProcessing
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 focus:ring-indigo-400'
          }`}
        >
          {state.isProcessing ? (
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : state.isRecording ? (
            <span className="w-4 h-4 bg-white rounded-sm" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        
        <span className="text-sm text-slate-400 select-none min-w-[120px]">
          {state.isProcessing 
            ? 'Transcription...' 
            : state.isRecording 
            ? 'Enregistrement...' 
            : 'Cliquez pour parler'}
        </span>
      </div>

      {/* Error display */}
      {state.error && (
        <div className="mt-3 text-center">
          <p className="text-red-400 text-sm">{state.error}</p>
          <button
            onClick={() => setState(prev => ({ ...prev, error: null }))}
            className="text-slate-500 text-xs hover:text-slate-400 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Transcript display */}
      {state.transcript && (
        <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
          <div className="flex justify-between items-start">
            <p className="text-slate-300 text-sm flex-1">{state.transcript}</p>
            <button
              onClick={clearTranscript}
              className="text-slate-500 hover:text-slate-400 ml-2"
              aria-label="Clear transcript"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

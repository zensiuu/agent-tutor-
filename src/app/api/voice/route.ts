import { NextRequest, NextResponse } from 'next/server'

// Configuration constants
const DEEPGRAM_API_URL = process.env.DEEPGRAM_API_URL || 'https://api.deepgram.com/v1/listen'
const DEFAULT_TIMEOUT_MS = 30000 // 30 seconds
const MAX_AUDIO_SIZE_MB = 10
const MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024

// Allowed audio MIME types
const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/m4a',
  'audio/flac',
  'audio/aac',
]

interface VoiceRequest {
  transcript?: string
  error?: string
}

/**
 * Validates the audio blob
 */
function validateAudio(audio: Blob | null, formData: FormData): { valid: true } | { valid: false; error: string } {
  if (!audio) {
    return { valid: false, error: 'No audio file provided' }
  }

  // Check file size
  if (audio.size > MAX_AUDIO_SIZE_BYTES) {
    return { valid: false, error: `Audio file too large. Maximum size is ${MAX_AUDIO_SIZE_MB}MB` }
  }

  if (audio.size === 0) {
    return { valid: false, error: 'Audio file is empty' }
  }

  // Check MIME type if available
  const mimeType = audio.type
  if (mimeType && !ALLOWED_AUDIO_TYPES.includes(mimeType)) {
    return { valid: false, error: `Unsupported audio format: ${mimeType}. Allowed formats: ${ALLOWED_AUDIO_TYPES.join(', ')}` }
  }

  return { valid: true }
}

export async function POST(request: NextRequest): Promise<NextResponse<VoiceRequest>> {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as Blob | null

    // Validate audio input
    const validation = validateAudio(audio, formData)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
      console.warn('Deepgram API key not configured - returning demo response')
      return NextResponse.json({
        transcript: '[Mode démonstration] Configurez la clé API Deepgram pour activer la transcription vocale.',
      })
    }

    // Build Deepgram URL with query parameters
    const deepgramUrl = new URL(DEEPGRAM_API_URL)
    deepgramUrl.searchParams.set('language', 'fr')
    deepgramUrl.searchParams.set('smart_format', 'true')
    deepgramUrl.searchParams.set('model', 'nova-2')

    // Use array buffer for fetch to avoid issues with ReadableStream
    const audioBuffer = await audio!.arrayBuffer()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

    try {
      const deepgramResponse = await fetch(deepgramUrl.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/webm', // Use a standard format for Deepgram
        },
        body: audioBuffer,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!deepgramResponse.ok) {
        const errorBody = await deepgramResponse.text().catch(() => 'Unknown error')
        console.error('Deepgram API error:', deepgramResponse.status, errorBody)
        return NextResponse.json(
          { error: 'Transcription service failed. Please try again.' },
          { status: 502 }
        )
      }

      const data = await deepgramResponse.json()

      // Safely extract transcript from Deepgram response structure
      const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ''

      return NextResponse.json({ transcript: transcript.trim() })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: `Transcription timed out after ${DEFAULT_TIMEOUT_MS / 1000} seconds` },
          { status: 504 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error('Voice transcription error:', error)

    let errorMessage = 'Transcription failed'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to transcription service'
        statusCode = 503
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as Blob

    if (!audio) {
      return NextResponse.json({ error: 'Audio required' }, { status: 400 })
    }

    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
      // Demo mode - return mock transcript
      return NextResponse.json({ 
        transcript: 'Demo mode - configure Deepgram API key' 
      })
    }

    const deepgramResponse = await fetch(
      'https://api.deepgram.com/v1/listen?language=fr&smart_format=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': audio.type,
        },
        body: audio,
      }
    )

    const data = await deepgramResponse.json()
    const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || ''

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Voice error:', error)
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
}

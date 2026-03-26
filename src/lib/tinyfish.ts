const TINYFISH_API_URL = 'https://agent.tinyfish.ai/v1'

export async function runTinyFishAgent(goal: string, url?: string) {
  const apiKey = process.env.TINYFISH_API_KEY
  
  if (!apiKey) {
    throw new Error('TINYFISH_API_KEY not configured')
  }

  const response = await fetch(`${TINYFISH_API_URL}/automation/run-sse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      url: url || 'https://www.google.com',
      goal,
    }),
  })

  if (!response.ok) {
    throw new Error(`TinyFish API error: ${response.statusText}`)
  }

  return response.json()
}

export async function searchWeb(query: string) {
  return runTinyFishAgent(
    `Search for: "${query}". Return the most relevant information found.`,
    `https://www.google.com/search?q=${encodeURIComponent(query)}`
  )
}

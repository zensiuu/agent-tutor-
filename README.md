# Tunisian Tutor 🇹🇳

AI-powered personal tutor for Tunisian Baccalaureate students (Info/Math streams).

## Features

### Core
- [x] **AI Chat** - Ask questions in French or Arabic, get instant answers powered by Llama 3.3 70B
- [x] **Voice Input** - Speak your questions, listen to explanations (Deepgram STT)
- [x] **5 Subjects** - Algorithmes, Bases de Données, TIC, Maths, Physique
- [x] **Memory** - Agent remembers your conversations and progress (Pinecone vector DB)

### Tools
- [x] **Web Search** - TinyFish-powered browsing for research
- [x] **Notes** - Take notes during study sessions
- [ ] **Wikipedia Integration** - Instant access to definitions (planned)
- [ ] **YouTube** - Video explanations for complex topics (planned)

### Workspace
- [x] **Topics** - Organized by Bac curriculum topics
- [x] **Notes Panel** - Take and save notes
- [ ] **Drawing** - Whiteboard for diagrams (planned)
- [ ] **Files** - Store PDFs, exercises, and documents (planned)

### Future
- [ ] **Exam Practice** - Quizzes with past Bac questions
- [ ] **Progress Tracking** - See what you've learned
- [ ] **Plugin Marketplace** - Community-built tools
- [ ] **Offline Mode** - Study without internet

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + React 19 + Tailwind CSS |
| AI Brain | Groq (Llama 3.3 70B) |
| Voice | Deepgram (STT - Nova 2) |
| Web Agents | TinyFish |
| Memory | Pinecone (Vector DB) |

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- API keys (see below)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/agent-tutor.git
cd agent-tutor

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# See .env.example for required variables

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start tutoring.

### API Keys (Free Tier)

| Service | Sign Up | Free Tier |
|---------|---------|-----------|
| Groq | [console.groq.com](https://console.groq.com) | 30 req/min |
| Deepgram | [deepgram.com](https://deepgram.com) | 200 min/month |
| TinyFish | [tinyfish.ai](https://tinyfish.ai) | 100 req/month |
| Pinecone | [pinecone.io](https://pinecone.io) | 1M vectors |

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/agent-tutor)

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Vercel (optimized for Next.js)
- Netlify
- Railway
- AWS Amplify
- Self-hosted (Node.js server)

## Project Structure

```
agent-tutor/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── chat/         # AI chat endpoint
│   │   │   ├── memory/       # Vector memory endpoints
│   │   │   ├── search/       # Web search endpoint
│   │   │   └── voice/        # Transcription endpoint
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── chat/             # Chat interface
│   │   ├── voice/            # Voice input
│   │   └── workspace/         # Tools & subjects
│   └── lib/
│       ├── types.ts          # TypeScript types
│       ├── groq.ts           # Groq API client
│       ├── memory.ts         # Pinecone memory
│       ├── subjects.ts       # Subject definitions
│       └── tinyfish.ts       # Web search agent
├── public/                   # Static assets
├── vercel.json              # Vercel configuration
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
├── .env.example             # Environment template
├── DEPLOYMENT.md            # Deployment guide
└── CHECKLIST.md             # Production checklist
```

## API Reference

### POST /api/chat
Send a message and get AI response.

```json
// Request
{
  "message": "Explique les algorithmes de tri",
  "history": [{"role": "user", "content": "..."}],
  "userId": "user_abc123",
  "sessionId": "session_123"
}

// Response
{
  "response": "Les algorithmes de tri sont...",
  "memories": 2
}
```

### POST /api/voice
Transcribe audio to text.

```
// Request: multipart/form-data
// audio: Blob (audio/webm, audio/wav, etc.)

// Response
{
  "transcript": "Explique les variables",
  "confidence": 0.95
}
```

### POST /api/memory
Store a memory entry.

```json
// Request
{
  "content": "Question sur les matrices",
  "userId": "user_abc123",
  "sessionId": "session_123",
  "type": "interaction",
  "subject": "mathematics"
}
```

### POST /api/memory/search
Search memories by query.

```json
// Request
{
  "query": "matrices",
  "userId": "user_abc123",
  "limit": 5
}

// Response
{
  "memories": [
    {"id": "...", "content": "...", "metadata": {...}}
  ]
}
```

### POST /api/search
Search the web using TinyFish agent.

```json
// Request
{"query": "théorème de Pythagore"}

// Response
{"success": true, "data": {...}}
```

## Architecture

### Type Safety
All types are centralized in `src/lib/types.ts`:
- `ChatMessage`, `Message`, `MemoryEntry`
- `SubjectId`, `SubjectDefinition`
- API request/response types
- Validation constants

### Error Handling
- All API routes have request validation
- Timeouts prevent hanging requests
- Graceful degradation when services fail
- User-friendly error messages

### Performance
- Serverless functions with timeouts
- Memory limits configured per route
- Optimized bundle size (~108KB First Load JS)
- Static pre-rendering where possible

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Free for Tunisian students 🇹🇳

See [LICENSE](LICENSE) for details.

## Acknowledgments

- Groq for fast AI inference
- Deepgram for accurate speech recognition
- TinyFish for web browsing capabilities
- Pinecone for vector search infrastructure
- Tunisian Ministry of Education for Baccalaureate curriculum

---

Made with ❤️ for Tunisian students

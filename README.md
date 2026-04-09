# <img src="https://em-content.zobj.net/source/apple/354/flag-tunisia_1f17e.svg" alt="Tunisian Flag" width="24"/> Agent Tutor

<div align="center">

**AI-powered personal tutor for Tunisian Baccalaureate students**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/agent-tutor)

</div>

---

## <img src="https://em-content.zobj.net/source/apple/354/rocket_1f680.svg" alt="Rocket" width="20"/> Quick Start

```bash
# Clone & Install
git clone https://github.com/YOUR_USERNAME/agent-tutor.git
cd agent-tutor
npm install

# Setup Environment
cp .env.example .env.local
# Add your API keys to .env.local

# Start Development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start tutoring!

---

## <img src="https://em-content.zobj.net/source/apple/354/brain_1f9e0.svg" alt="Brain" width="20"/> Features

### <img src="https://em-content.zobj.net/source/apple/354/graduation-cap_1f393.svg" alt="Graduation Cap" width="16"/> Core Learning
- **AI Chat** - Ask questions in French/Arabic with Llama 3.3 70B
- **Voice Input** - Speak your questions, get voice explanations
- **5 Subjects** - Algorithmes, Bases de Données, TIC, Maths, Physique
- **Memory System** - Agent remembers your conversations and progress

### <img src="https://em-content.zobj.net/source/apple/354/tools_1f927.svg" alt="Tools" width="16"/> Study Tools
- **Web Search** - TinyFish-powered research capabilities
- **Smart Notes** - Take and organize study notes
- **Topic Organization** - Structured by Bac curriculum
- **Interactive Workspace** - Modern study environment

### <img src="https://em-content.zobj.net/source/apple/354/rocket_1f680.svg" alt="Rocket" width="16"/> Coming Soon
- [ ] Exam Practice with past Bac questions
- [ ] Progress Tracking & Analytics
- [ ] Wikipedia Integration
- [ ] YouTube Video Explanations
- [ ] Drawing Whiteboard
- [ ] File Storage (PDFs, exercises)
- [ ] Plugin Marketplace
- [ ] Offline Mode

---

## <img src="https://em-content.zobj.net/source/apple/354/gear_2699.svg" alt="Gear" width="20"/> Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15 + React 19 | Modern web framework |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **AI Brain** | Groq (Llama 3.3 70B) | Fast AI inference |
| **Voice** | Deepgram (STT) | Speech recognition |
| **Memory** | Pinecone (Vector DB) | Conversation memory |
| **Search** | TinyFish | Web browsing agent |
| **Deployment** | Vercel | Serverless hosting |

---

## <img src="https://em-content.zobj.net/source/apple/354/key_1f511.svg" alt="Key" width="20"/> API Keys Setup

| Service | Free Tier | Sign Up |
|---------|-----------|---------|
| **Groq** | 30 req/min | [console.groq.com](https://console.groq.com) |
| **Deepgram** | 200 min/month | [deepgram.com](https://deepgram.com) |
| **TinyFish** | 100 req/month | [tinyfish.ai](https://tinyfish.ai) |
| **Pinecone** | 1M vectors | [pinecone.io](https://pinecone.io) |

<div align="center">

**All services have generous free tiers perfect for students!**

</div>

---

## <img src="https://em-content.zobj.net/source/apple/354/folder_1f4c1.svg" alt="Folder" width="20"/> Project Structure

```
agent-tutor/
src/
  app/                    # Next.js App Router
    api/                  # API endpoints
      chat/              # AI chat
      memory/            # Vector memory
      search/            # Web search
      voice/             # Speech recognition
    globals.css           # Global styles
    layout.tsx            # Root layout
    page.tsx              # Home page
  components/             # React components
    chat/                # Chat interface
    voice/               # Voice components
    workspace/           # Study tools
  hooks/                 # Custom React hooks
  lib/                   # Core utilities
    brain.ts             # AI logic
    memory.ts            # Memory management
    search/              # Web search
    subjects.ts          # Subject definitions
  types/                 # TypeScript definitions
    types.ts             # Centralized types
  utils/                 # Helper functions
  constants/             # App constants
public/                  # Static assets
tests/                   # Test files
docs/                    # Documentation
```

---

## <img src="https://em-content.zobj.net/source/apple/354/puzzle-piece_1f9e9.svg" alt="Puzzle Piece" width="20"/> API Reference

### Chat API
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Explique les algorithmes de tri",
  "history": [{"role": "user", "content": "..."}],
  "userId": "user_abc123",
  "sessionId": "session_123"
}
```

### Voice API
```http
POST /api/voice
Content-Type: multipart/form-data

audio: [audio file]
```

### Memory API
```http
POST /api/memory
Content-Type: application/json

{
  "content": "Question sur les matrices",
  "userId": "user_abc123",
  "sessionId": "session_123",
  "type": "interaction",
  "subject": "mathematics"
}
```

---

## <img src="https://em-content.zobj.net/source/apple/354/shield_1f969.svg" alt="Shield" width="20"/> Architecture Highlights

### <img src="https://em-content.zobj.net/source/apple/354/check-mark_2713.svg" alt="Check" width="14"/> Type Safety
- Centralized TypeScript definitions
- Full API type coverage
- Runtime validation

### <img src="https://em-content.zobj.net/source/apple/354/check-mark_2713.svg" alt="Check" width="14"/> Performance
- Optimized bundle size (~108KB First Load JS)
- Serverless functions with timeouts
- Efficient memory management

### <img src="https://em-content.zobj.net/source/apple/354/check-mark_2713.svg" alt="Check" width="14"/> Error Handling
- Request validation on all endpoints
- Graceful degradation
- User-friendly error messages
- Timeout protection

---

## <img src="https://em-content.zobj.net/source/apple/354/rocket_1f680.svg" alt="Rocket" width="20"/> Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Other Platforms
- Netlify
- Railway
- AWS Amplify
- Self-hosted (Node.js)

<div align="center">

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions**

</div>

---

## <img src="https://em-content.zobj.net/source/apple/354/heart_2764.svg" alt="Heart" width="20"/> Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## <img src="https://em-content.zobj.net/source/apple/354/flag-tunisia_1f17e.svg" alt="Tunisian Flag" width="16"/> License

**Free for Tunisian students** 

See [LICENSE](LICENSE) for details.

---

## <img src="https://em-content.zobj.net/source/apple/354/trophy_1f3c6.svg" alt="Trophy" width="20"/> Acknowledgments

- Groq for fast AI inference
- Deepgram for accurate speech recognition
- TinyFish for web browsing capabilities
- Pinecone for vector search infrastructure
- Tunisian Ministry of Education for Baccalaureate curriculum

---

<div align="center">

**Made with <img src="https://em-content.zobj.net/source/apple/354/heart_2764.svg" alt="Heart" width="16"/> for Tunisian students**

<img src="https://em-content.zobj.net/source/apple/354/flag-tunisia_1f17e.svg" alt="Tunisian Flag" width="24"/>

</div>

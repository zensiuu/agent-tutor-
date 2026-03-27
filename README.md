# Tunisian Tutor 🇹🇳

AI-powered personal tutor for Tunisian Baccalaureate students (Info/Math).

## Features

### Core
- [ ] **AI Chat** - Ask questions in French or Arabic, get instant answers
- [ ] **Voice Input** - Speak your questions, listen to explanations
- [ ] **5 Subjects** - Algorithmes, Bases de Données, TIC, Maths, Physique
- [ ] **Memory** - Agent remembers your conversations and progress

### Tools
- [ ] **Web Search** - TinyFish-powered browsing for research
- [ ] **Wikipedia** - Instant access to definitions and concepts
- [ ] **YouTube** - Video explanations for complex topics

### Workspace
- [ ] **Notes** - Take notes during study sessions
- [ ] **Drawing** - Whiteboard for diagrams and sketches
- [ ] **Files** - Store PDFs, exercises, and documents
- [ ] **Topics** - Organized by Bac curriculum topics

### Future
- [ ] **Exam Practice** - Quizzes with past Bac questions
- [ ] **Progress Tracking** - See what you've learned
- [ ] **Plugin Marketplace** - Community-built tools
- [ ] **Offline Mode** - Study without internet

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + React 19 + Tailwind |
| AI Brain | Groq (Llama 3.3 70B) |
| Voice | Deepgram (STT) |
| Web Agents | TinyFish |
| Memory | Pinecone (Vector DB) |

## Setup

```bash
# 1. Clone & install
npm install

# 2. Add API keys to .env.local
GROQ_API_KEY=your_key
DEEPGRAM_API_KEY=your_key
TINYFISH_API_KEY=your_key
PINECONE_API_KEY=your_key

# 3. Run
npm run dev
```

## API Keys (Free Tier)

| Service | Link |
|---------|------|
| Groq | console.groq.com |
| Deepgram | deepgram.com |
| TinyFish | tinyfish.ai |
| Pinecone | pinecone.io |

## License

Free for Tunisian students 🇹🇳

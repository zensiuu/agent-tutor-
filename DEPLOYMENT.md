# Tunisian Tutor v2.0 - Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/agent-tutor)

### One-Click Setup

1. Click the Deploy button above
2. Add your environment variables (see below)
3. Deploy!

---

## Environment Variables

All environment variables are **required** for full functionality. Copy `.env.example` to `.env.local` for local development.

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `HUGGINGFACE_API_KEY` | AI brain (DeepSeek-R1, Qwen models) | [huggingface.co](https://huggingface.co/settings/tokens) |
| `TAVILY_API_KEY` | Web search optimized for AI | [tavily.com](https://tavily.com) |
| `DEEPGRAM_API_KEY` | Speech-to-text transcription | [deepgram.com](https://deepgram.com) |
| `PINECONE_API_KEY` | Vector database for memory | [pinecone.io](https://pinecone.io) |
| `PINECONE_INDEX_URL` | Your Pinecone index endpoint | From Pinecone dashboard |

---

## Database Requirements

### Pinecone Vector Database

**Tier:** Free (Starter)
- **1M vectors** included
- **3 indexes** maximum
- **Dimensions:** 384 (for MiniLM embeddings)

**Setup:**
1. Create account at [pinecone.io](https://pinecone.io)
2. Create a new index with:
   - **Name:** `tunisian-tutor` (or your choice)
   - **Dimensions:** 384
   - **Metric:** Cosine
3. Copy the index URL (e.g., `https://your-index.svc.pinecone.io`)
4. Add to `PINECONE_INDEX_URL` environment variable

---

## Third-Party Service Dependencies

| Service | Purpose | Free Tier Limits | Notes |
|---------|---------|-----------------|-------|
| **HuggingFace** | AI Brain + Embeddings | Rate limited | DeepSeek-R1, Qwen models |
| **Tavily** | Web Search | 1000 credits/month | AI-optimized search |
| **Deepgram** | Speech-to-Text | 200 min/month | Fast transcription |
| **Pinecone** | Vector Memory | 1M vectors, 3 indexes | Fast similarity search |

---

## API Rate Limits & Quotas

### HuggingFace Inference API
- **Rate Limit:** Varies by model popularity
- **Models Used:** DeepSeek-R1-Distill-Qwen-7B, Qwen2.5-7B, Qwen2.5-1.5B
- **Automatic fallback** between models

### Tavily Search API
- **Free Tier:** 1000 credits/month
- **Basic search:** ~1 credit per query
- **Deep search:** ~5 credits per query

### Deepgram API
- **Free Tier:** 200 minutes per month
- **Audio Format:** Prefer `audio/webm` or `audio/wav`

### Pinecone
- **Write Rate:** Varies by index
- **Query Rate:** Up to 1000 queries/sec (paid tiers)
- **Metadata Limit:** 40KB per vector

---

## Vercel Configuration

### Project Settings

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["fra1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "memory": 512,
      "maxDuration": 60
    }
  }
}
```

### Function Configuration

| Route | Memory | Timeout | Use Case |
|-------|--------|---------|----------|
| `/api/chat` | 512MB | 60s | AI chat completions |
| `/api/voice` | 256MB | 30s | Transcription |
| `/api/search` | 512MB | 30s | Web searches |
| `/api/memory/*` | 256MB | 15s | Vector operations |

---

## Security Considerations

### Environment Variables
- Never commit `.env` files
- Use Vercel dashboard for production secrets
- Rotate API keys regularly

### API Security Headers (included in vercel.json)
```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Content-Security-Policy": "default-src 'self'..."
}
```

---

## Troubleshooting

### Common Issues

**"HUGGINGFACE_API_KEY not configured"**
- Add `HUGGINGFACE_API_KEY` to environment variables
- Get token from https://huggingface.co/settings/tokens

**"TAVILY_API_KEY not configured"**
- Add `TAVILY_API_KEY` to environment variables
- Get key from https://tavily.com

**"Microphone permission denied"**
- User must grant browser microphone access
- Check HTTPS is enabled (required for getUserMedia)

**"Pinecone query failed"**
- Verify `PINECONE_INDEX_URL` is correct
- Check Pinecone index exists and is ready
- Ensure `PINECONE_API_KEY` is valid
- Note: Dimensions should be 384 (not 768)

### Health Check

Test API endpoints:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

## Deployment Checklist

- [ ] Get HuggingFace API key from https://huggingface.co/settings/tokens
- [ ] Get Tavily API key from https://tavily.com
- [ ] Keep existing Deepgram API key
- [ ] Update Pinecone index to 384 dimensions (not 768)
- [ ] Add all environment variables to Vercel
- [ ] Remove old `GROQ_API_KEY` from Vercel
- [ ] Test chat functionality
- [ ] Test search functionality
- [ ] Verify memory storage and retrieval

---

*Last updated: 2026-03-28*

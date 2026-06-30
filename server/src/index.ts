import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeRouter } from './routes/analyze';
import { errorHandler } from './middleware/errorHandler';
import { checkHealth, config } from './services/ollamaService';

// Load environment variables — override:true ensures .env always wins over shell env
dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', analyzeRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'SkillMatch API is running (Local RAG)' });
});

// LLM Health check — verifies Ollama is reachable and lists available models
app.get('/api/health/llm', async (_req, res) => {
  const health = await checkHealth();
  res.status(health.ok ? 200 : 503).json({
    ollama: health.ok ? 'connected' : 'unreachable',
    baseUrl: config.baseUrl,
    chatModel: config.chatModel,
    embedModel: config.embedModel,
    availableModels: health.models,
    error: health.error,
  });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   POST /api/upload-jd`);
  console.log(`   POST /api/upload-resumes`);
  console.log(`   POST /api/analyze`);
  console.log(`   GET  /api/health/llm`);
  console.log(`\n🧠 Local LLM Configuration:`);
  console.log(`   Ollama:     ${config.baseUrl}`);
  console.log(`   Chat Model: ${config.chatModel}`);
  console.log(`   Embed Model: ${config.embedModel}`);

  // Verify Ollama connectivity at startup
  const health = await checkHealth();
  if (health.ok) {
    console.log(`   Status:     ✅ Connected (${health.models.length} models available)`);
  } else {
    console.warn(`   Status:     ⚠️  Ollama not reachable — ${health.error}`);
    console.warn(`   💡 Make sure Ollama is running: https://ollama.com`);
  }
});

export default app;

/**
 * Ollama REST API Service
 *
 * Wraps the Ollama local server (http://localhost:11434) for:
 *   - Text embeddings  (POST /api/embed)
 *   - Chat completions (POST /api/generate)
 *   - Health checks    (GET  /)
 *
 * Uses native fetch (Node 18+). Zero npm dependencies.
 */

// ── Configuration ─────────────────────────────────────────────────────────────

const OLLAMA_BASE =
  process.env.OLLAMA_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:11434';

const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'llama3.2';
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OllamaEmbedResponse {
  embeddings: number[][];
}

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

interface OllamaTagsResponse {
  models: { name: string; size: number; modified_at: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ollamaFetch<T>(
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const url = `${OLLAMA_BASE}${path}`;
  const opts: RequestInit = body
    ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    : { method: 'GET' };

  const res = await fetch(url, opts);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Ollama ${opts.method} ${path} failed (${res.status}): ${text}`
    );
  }

  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate an embedding vector for `text` using the configured embedding model.
 * Returns a single dense float[] vector.
 */
export async function embed(text: string): Promise<number[]> {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const data = await ollamaFetch<OllamaEmbedResponse>('/api/embed', {
    model: EMBED_MODEL,
    input: trimmed,
  });

  if (!data.embeddings || data.embeddings.length === 0) {
    throw new Error('Ollama returned empty embeddings.');
  }

  return data.embeddings[0];
}

/**
 * Generate multiple embedding vectors in a single API call (batched).
 * Returns one vector per input string.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const cleaned = texts.map((t) => t.trim()).filter(Boolean);
  if (cleaned.length === 0) return [];

  // Ollama /api/embed supports `input` as a string array
  const data = await ollamaFetch<OllamaEmbedResponse>('/api/embed', {
    model: EMBED_MODEL,
    input: cleaned,
  });

  if (!data.embeddings || data.embeddings.length !== cleaned.length) {
    throw new Error(
      `Ollama embedding count mismatch: expected ${cleaned.length}, got ${data.embeddings?.length ?? 0}`
    );
  }

  return data.embeddings;
}

/**
 * Send a prompt to the local chat LLM and get the full response text.
 * Uses `/api/generate` with `stream: false` for a single response.
 */
export async function chat(
  prompt: string,
  options?: { temperature?: number; model?: string; format?: string }
): Promise<string> {
  const model = options?.model || CHAT_MODEL;
  const temperature = options?.temperature ?? 0.2;

  console.log(`🤖 Sending to Ollama [${model}]…`);

  const payload: any = {
    model,
    prompt,
    stream: false,
    options: {
      temperature,
      num_predict: 4096, // max tokens to generate
    },
  };
  
  if (options?.format) {
    payload.format = options.format;
  }

  const data = await ollamaFetch<OllamaGenerateResponse>('/api/generate', payload);

  console.log('✅ Ollama response received.');
  return data.response || '';
}

/**
 * Check whether the Ollama server is reachable and list available models.
 */
export async function checkHealth(): Promise<{
  ok: boolean;
  models: string[];
  error?: string;
}> {
  try {
    const data = await ollamaFetch<OllamaTagsResponse>('/api/tags');
    const models = (data.models || []).map((m) => m.name);
    return { ok: true, models };
  } catch (err) {
    return {
      ok: false,
      models: [],
      error: (err as Error).message,
    };
  }
}

/**
 * Expose model names for external reference.
 */
export const config = {
  get chatModel() {
    return CHAT_MODEL;
  },
  get embedModel() {
    return EMBED_MODEL;
  },
  get baseUrl() {
    return OLLAMA_BASE;
  },
};

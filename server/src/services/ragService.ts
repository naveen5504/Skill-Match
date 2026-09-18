/**
 * RAG Service — Retrieval-Augmented Generation for Resume Ranking
 *
 * Pipeline:
 *   1. Embed the Job Description
 *   2. Chunk each resume into overlapping text blocks
 *   3. Embed every chunk
 *   4. Compute cosine similarity (JD ↔ best resume chunks) → semantic score
 *   5. Send top context + JD to local LLM for strengths/gaps/recommendation
 *   6. Combine scores → final matchScore (0–100)
 *   7. Sort and return CandidateAnalysis[]
 */

import { embed, embedBatch, chat } from './ollamaService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CandidateAnalysis {
  candidateName: string;
  matchScore: number;        // 0–100
  keyStrengths: string[];    // 2–3 points
  keyGaps: string[];         // 2–3 points
  recommendation: 'Strong Fit' | 'Moderate Fit' | 'Not Fit';
}

interface ResumeInput {
  fileName: string;
  text: string;
}

interface ChunkWithEmbedding {
  text: string;
  embedding: number[];
}

// ── Vector Math ───────────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ── Text Chunking ─────────────────────────────────────────────────────────────

const CHUNK_SIZE = 512;       // characters per chunk
const CHUNK_OVERLAP = 128;    // overlap between adjacent chunks

function chunkText(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= CHUNK_SIZE) return [cleaned];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    chunks.push(cleaned.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

// ── Semantic Scoring ──────────────────────────────────────────────────────────

/**
 * Compute a semantic similarity score (0–1) between the JD embedding
 * and the best-matching chunks of a resume.
 *
 * Returns the average of the top-K chunk similarities to capture
 * breadth of relevance (not just a single lucky chunk).
 */
function semanticScore(
  jdEmbedding: number[],
  chunks: ChunkWithEmbedding[],
  topK = 3
): number {
  if (chunks.length === 0) return 0;

  const similarities = chunks
    .map((c) => cosineSimilarity(jdEmbedding, c.embedding))
    .sort((a, b) => b - a);

  const k = Math.min(topK, similarities.length);
  const topScores = similarities.slice(0, k);
  return topScores.reduce((sum, s) => sum + s, 0) / k;
}

// ── LLM Analysis ──────────────────────────────────────────────────────────────

interface LLMAnalysis {
  candidateName: string;
  llmScore: number;          // 0–100, the LLM's own assessment
  keyStrengths: string[];
  keyGaps: string[];
}

/**
 * Ask the local LLM to analyse a single resume against the JD.
 * Returns structured analysis with name, strengths, gaps, and a score.
 */
async function llmAnalyze(
  jdText: string,
  resumeText: string,
  fileName: string
): Promise<LLMAnalysis> {
  const prompt = `You are an expert technical recruiter and hiring manager.
Analyze the following candidate resume against the Job Description.

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON object. No markdown, no code fences, no explanation.
- The JSON must have EXACTLY these fields:
{
  "candidateName": "Full name from resume, or 'Unknown' if not found",
  "llmScore": <integer 0-100 representing overall fit>,
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "keyGaps": ["gap 1", "gap 2", "gap 3"]
}
- llmScore: 80-100 = excellent fit, 50-79 = moderate, 0-49 = poor fit
- keyStrengths: 2-3 concise phrases about why this candidate is a good match
- keyGaps: 2-3 concise phrases about what's missing or weak
- Be precise and specific, referencing actual skills/experience from the resume

=== JOB DESCRIPTION ===
${jdText.slice(0, 3000)}

=== CANDIDATE RESUME (${fileName}) ===
${resumeText.slice(0, 4000)}

Return ONLY the JSON object:`;

  const raw = await chat(prompt, { temperature: 0.2, format: 'json' });

  // Extract JSON from the response (LLM might wrap it in code fences)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn(`⚠️  Could not extract JSON for ${fileName}. Raw response:`, raw.slice(0, 200));
    return {
      candidateName: fileName.replace(/\.pdf$/i, ''),
      llmScore: 50,
      keyStrengths: ['Could not fully analyze — resume may be partially readable'],
      keyGaps: ['Analysis incomplete due to parsing issues'],
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      candidateName: parsed.candidateName || fileName.replace(/\.pdf$/i, ''),
      llmScore: Math.min(100, Math.max(0, Math.round(parsed.llmScore ?? 50))),
      keyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths.slice(0, 3) : [],
      keyGaps: Array.isArray(parsed.keyGaps) ? parsed.keyGaps.slice(0, 3) : [],
    };
  } catch (parseErr) {
    console.warn(`⚠️  JSON parse failed for ${fileName}:`, (parseErr as Error).message);
    return {
      candidateName: fileName.replace(/\.pdf$/i, ''),
      llmScore: 50,
      keyStrengths: ['Resume was partially analyzed'],
      keyGaps: ['Structured analysis could not be completed'],
    };
  }
}

// ── Main RAG Pipeline ─────────────────────────────────────────────────────────

/**
 * Full RAG analysis pipeline:
 *   JD + Resumes → Embeddings → Cosine scoring → LLM analysis → Ranked output
 */
export async function analyzeResumesWithRAG(
  jdText: string,
  resumes: ResumeInput[]
): Promise<CandidateAnalysis[]> {
  console.log(`\n📊 RAG Pipeline starting — ${resumes.length} candidates`);
  const startTime = Date.now();

  // ── Step 1: Embed the Job Description ───────────────────────────────────────
  console.log('🔍 Step 1: Embedding job description…');
  const jdEmbedding = await embed(jdText);

  // ── Step 2 & 3: Chunk and embed each resume ────────────────────────────────
  console.log('📄 Step 2: Chunking and embedding resumes…');

  const resumeChunks: { resume: ResumeInput; chunks: ChunkWithEmbedding[] }[] = [];

  for (const resume of resumes) {
    if (!resume.text.trim()) {
      resumeChunks.push({ resume, chunks: [] });
      continue;
    }

    const textChunks = chunkText(resume.text);
    const embeddings = await embedBatch(textChunks);

    const chunksWithEmbeddings: ChunkWithEmbedding[] = textChunks.map(
      (text, i) => ({ text, embedding: embeddings[i] })
    );

    resumeChunks.push({ resume, chunks: chunksWithEmbeddings });
    console.log(`   ✓ ${resume.fileName}: ${textChunks.length} chunks embedded`);
  }

  // ── Step 4: Semantic scoring ────────────────────────────────────────────────
  console.log('📐 Step 3: Computing semantic similarity scores…');

  const semanticScores = resumeChunks.map(({ resume, chunks }) => ({
    resume,
    chunks,
    rawSemantic: semanticScore(jdEmbedding, chunks),
  }));

  // Log raw semantic scores
  for (const { resume, rawSemantic } of semanticScores) {
    console.log(`   → ${resume.fileName}: semantic = ${(rawSemantic * 100).toFixed(1)}%`);
  }

  // ── Step 5: LLM analysis for each candidate ────────────────────────────────
  console.log('🧠 Step 4: Running LLM analysis per candidate…');

  const candidates: CandidateAnalysis[] = [];

  // Process sequentially to avoid overwhelming local LLM
  for (const { resume, rawSemantic } of semanticScores) {
    const llmResult = await llmAnalyze(jdText, resume.text, resume.fileName);

    // ── Step 6: Combine scores ──────────────────────────────────────────────
    // 60% semantic similarity + 40% LLM assessment
    const semanticComponent = rawSemantic * 100 * 0.6;
    const llmComponent = llmResult.llmScore * 0.4;
    const combinedScore = Math.min(100, Math.max(0, Math.round(semanticComponent + llmComponent)));

    // Determine recommendation bucket
    const recommendation: CandidateAnalysis['recommendation'] =
      combinedScore >= 80
        ? 'Strong Fit'
        : combinedScore >= 50
          ? 'Moderate Fit'
          : 'Not Fit';

    candidates.push({
      candidateName: llmResult.candidateName,
      matchScore: combinedScore,
      keyStrengths: llmResult.keyStrengths,
      keyGaps: llmResult.keyGaps,
      recommendation,
    });

    console.log(
      `   ✓ ${llmResult.candidateName}: semantic=${(rawSemantic * 100).toFixed(0)}% ` +
      `llm=${llmResult.llmScore}% → combined=${combinedScore}% [${recommendation}]`
    );
  }

  // ── Step 7: Sort by score descending ──────────────────────────────────────
  candidates.sort((a, b) => b.matchScore - a.matchScore);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ RAG Pipeline complete in ${elapsed}s — ${candidates.length} candidates ranked\n`);

  return candidates;
}

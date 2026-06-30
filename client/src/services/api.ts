import axios from 'axios';
import type { AnalyzeResponse } from '../types';

/**
 * Axios instance.
 * In development, Vite proxies /api → http://localhost:3001 (see vite.config.ts).
 */
const api = axios.create({
  baseURL: '', // Uses Vite proxy → http://localhost:3001 (see vite.config.ts)
  timeout: 300000, // 5-minute timeout to allow local LLM processing time
});

/**
 * Send JD text (or PDF file) and multiple resume files to the backend for AI analysis.
 *
 * Uses multipart/form-data so that PDF buffers are streamed to the server.
 */
export async function analyzeResumes(
  jdText: string,
  jdFile: File | null,
  resumeFiles: File[]
): Promise<AnalyzeResponse> {
  const form = new FormData();

  if (jdFile) {
    form.append('jdFile', jdFile);
  } else {
    form.append('jdText', jdText);
  }

  resumeFiles.forEach((file) => form.append('resumes', file));

  const { data } = await api.post<AnalyzeResponse>('/api/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

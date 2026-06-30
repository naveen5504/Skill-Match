// Shared TypeScript interfaces for the Resume Analyzer app

export interface CandidateAnalysis {
  candidateName: string;
  matchScore: number;           // 0–100
  keyStrengths: string[];       // 2–3 items
  keyGaps: string[];            // 2–3 items
  recommendation: 'Strong Fit' | 'Moderate Fit' | 'Not Fit';
}

export interface AnalyzeResponse {
  candidates: CandidateAnalysis[];
  count: number;
}

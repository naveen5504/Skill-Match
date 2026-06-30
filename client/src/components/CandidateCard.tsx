import React from 'react';
import type { CandidateAnalysis } from '../types';
import { HiTrophy, HiStar, HiExclamationTriangle, HiAcademicCap } from 'react-icons/hi2';
import { FaMedal } from 'react-icons/fa6';

interface CandidateCardProps {
  candidate: CandidateAnalysis;
  rank: number;
}

const getFitBadge = (fit: string) => {
  switch (fit) {
    case 'Strong Fit':
      return {
        bg: 'var(--badge-strong-bg)',
        text: 'var(--badge-strong-text)',
        border: 'var(--badge-strong-border)',
        icon: '✓',
        color: '#4A7C59',
      };
    case 'Moderate Fit':
      return {
        bg: 'var(--badge-moderate-bg)',
        text: 'var(--badge-moderate-text)',
        border: 'var(--badge-moderate-border)',
        icon: '≈',
        color: '#B8860B',
      };
    case 'Not Fit':
    default:
      return {
        bg: 'var(--badge-weak-bg)',
        text: 'var(--badge-weak-text)',
        border: 'var(--badge-weak-border)',
        icon: '✕',
        color: '#C0564B',
      };
  }
};

const getRankMedal = (rank: number) => {
  if (rank === 1) return { icon: <HiTrophy size={18} />, label: '1st Place', color: 'linear-gradient(135deg, #C4956A, #A0522D)' };
  if (rank === 2) return { icon: <FaMedal size={18} />, label: '2nd Place', color: 'linear-gradient(135deg, #A89585, #7A6555)' };
  if (rank === 3) return { icon: <HiAcademicCap size={18} />, label: '3rd Place', color: 'linear-gradient(135deg, #8B6E5A, #6B5444)' };
  return { icon: null, label: null, color: 'var(--bg-elevated)' };
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, rank }) => {
  const badgeStyle = getFitBadge(candidate.recommendation);
  const medal = getRankMedal(rank);

  // Circular Progress Calculation
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (candidate.matchScore / 100) * circumference;

  return (
    <div className="candidate-card-glow saas-card group relative overflow-hidden transition-all duration-500">

      <div className="p-8">
        <div className="flex flex-col xl:flex-row gap-10 items-start">

          {/* Score Ring */}
          <div className="flex-shrink-0 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="var(--border-primary)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="var(--accent-primary)"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-xl font-bold leading-none"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
              >
                {candidate.matchScore}%
              </span>
              <span className="text-[8px] font-bold uppercase tracking-tighter mt-1 leading-none" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                Match
              </span>
            </div>

            {/* Rank Badge */}
            {medal.icon && (
              <div
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2"
                style={{ background: medal.color, borderColor: 'var(--bg-card)', color: '#ffffff' }}
              >
                {medal.icon}
              </div>
            )}
          </div>

          {/* Candidate Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3
                  className="text-2xl font-bold tracking-tight leading-tight transition-colors"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
                >
                  {candidate.candidateName}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                    style={{
                      background: badgeStyle.bg,
                      color: badgeStyle.text,
                      border: `1px solid ${badgeStyle.border}`,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span className="text-sm font-normal">{badgeStyle.icon}</span>
                    {candidate.recommendation}
                  </span>
                  {medal.label && (
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                      Ranked {medal.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Strengths */}
              <div
                className="p-5 rounded-2xl relative transition-all"
                style={{
                  background: 'var(--strength-bg)',
                  border: '1px solid var(--strength-border)',
                }}
              >
                <h4
                  className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
                  style={{ color: 'var(--badge-strong-text)', fontFamily: "'Inter', sans-serif" }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                    style={{ background: 'var(--badge-strong-bg)', border: '1px solid var(--badge-strong-border)' }}
                  ><HiStar size={14} /></div>
                  Key Strengths
                </h4>
                <ul className="space-y-3">
                  {candidate.keyStrengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif" }}>
                      <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--badge-strong-text)' }} />
                      {str}
                    </li>
                  ))}
                  {candidate.keyStrengths.length === 0 && <li className="italic text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'Lora', serif" }}>No specific strengths noted.</li>}
                </ul>
              </div>

              {/* Gaps */}
              <div
                className="p-5 rounded-2xl relative transition-all"
                style={{
                  background: 'var(--gap-bg)',
                  border: '1px solid var(--gap-border)',
                }}
              >
                <h4
                  className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
                  style={{ color: 'var(--badge-weak-text)', fontFamily: "'Inter', sans-serif" }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                    style={{ background: 'var(--badge-weak-bg)', border: '1px solid var(--badge-weak-border)' }}
                  ><HiExclamationTriangle size={14} /></div>
                  Potential Gaps
                </h4>
                <ul className="space-y-3">
                  {candidate.keyGaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif" }}>
                      <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--badge-weak-text)' }} />
                      {gap}
                    </li>
                  ))}
                  {candidate.keyGaps.length === 0 && <li className="italic text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'Lora', serif" }}>No significant gaps found.</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;

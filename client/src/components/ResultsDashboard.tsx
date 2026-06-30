import React, { useMemo } from 'react';
import CandidateCard from './CandidateCard';
import type { CandidateAnalysis } from '../types';
import { TbTargetArrow } from 'react-icons/tb';
import { HiArrowPath, HiStar, HiArrowTrendingUp, HiUsers } from 'react-icons/hi2';

// ── Radial Score Chart ──────────────────────────────────────
const CHART_COLORS = ['#A0522D', '#8B6E5A', '#C4956A', '#B8860B', '#4A7C59', '#7B8D6E', '#D4A574'];

const RadialScoreChart: React.FC<{ data: { name: string; score: number }[] }> = ({ data }) => {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 14;
  const gap = 4;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, i) => {
          const radius = (size / 2) - (strokeWidth + gap) * i - strokeWidth;
          if (radius < 20) return null;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (item.score / 100) * circumference;
          const color = CHART_COLORS[i % CHART_COLORS.length];

          return (
            <g key={item.name}>
              {/* Track */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="var(--border-primary)"
                strokeWidth={strokeWidth}
                opacity={0.4}
              />
              {/* Score Arc */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
              />
            </g>
          );
        })}
        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="700" fontFamily="'Cormorant Garamond', serif" fontStyle="italic">
          {data.length}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontWeight="700" letterSpacing="0.1em" fontFamily="'Inter', sans-serif">
          CANDIDATES
        </text>
      </svg>

      {/* Legend */}
      <div className="w-full space-y-2">
        {data.map((item, i) => {
          const color = CHART_COLORS[i % CHART_COLORS.length];
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
              </div>
              <span className="font-black tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>{item.score}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ResultsDashboardProps {
  candidates: CandidateAnalysis[];
  onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ candidates, onReset }) => {
  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [candidates]);

  const chartData = useMemo(() => {
    return sortedCandidates.map(c => ({
      name: c.candidateName || 'Unknown',
      score: c.matchScore || 0,
    }));
  }, [sortedCandidates]);

  const bestCandidate = sortedCandidates[0];
  const avgScore = Math.round(
    sortedCandidates.reduce((acc, c) => acc + (c.matchScore || 0), 0) / (sortedCandidates.length || 1)
  );

  const fitCounts = useMemo(() => {
    return sortedCandidates.reduce((acc, c) => {
      acc[c.recommendation] = (acc[c.recommendation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [sortedCandidates]);

  if (!candidates || candidates.length === 0) return (
    <div className="saas-card p-12 text-center">
      <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No candidates to display. Please try again.</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in-up">

      {/* ── Dashboard Header ── */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <TbTargetArrow size={12} /> Rank Analysis Complete
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
          >
            Meet your <span className="gradient-text">Top Talent.</span>
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif" }}>
            AI has processed {candidates.length} candidates. We've identified the best matches based on technical proficiency, experience density, and requirement alignment.
          </p>
        </div>
        <button
          onClick={onReset}
          className="btn-secondary px-6 py-3 flex items-center justify-center gap-2 font-bold text-sm"
        >
          <HiArrowPath size={16} /> New Analysis
        </button>
      </div>

      {/* ── Top Level Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Best Candidate */}
        <div className="saas-card saas-card-hover p-8">
          <div className="flex items-start gap-5">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', color: 'var(--accent-primary)' }}
            ><HiStar size={22} /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Highest Potential</p>
              <p className="text-lg font-bold truncate" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}>{bestCandidate?.candidateName}</p>
              <p className="text-xs font-bold mt-1" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>{bestCandidate?.matchScore}% Match Score</p>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="saas-card saas-card-hover p-8">
          <div className="flex items-start gap-5">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', color: 'var(--accent-secondary)' }}
            ><HiArrowTrendingUp size={22} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Batch Quality</p>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}>{avgScore}%</p>
              <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>Average compatibility</p>
            </div>
          </div>
        </div>

        {/* Strong Fits */}
        <div className="saas-card saas-card-hover p-8">
          <div className="flex items-start gap-5">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', color: 'var(--accent-warm)' }}
            ><HiUsers size={22} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Elite Matches</p>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}>{fitCounts['Strong Fit'] || 0}</p>
              <p className="text-[10px] font-bold italic mt-1" style={{ color: 'var(--badge-strong-text)', fontFamily: "'Lora', serif" }}>Recommended for hire</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Candidates & Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
            >
              Candidate Performance Ranking
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Total: {candidates.length} Scored</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {sortedCandidates.map((candidate, index) => (
              <CandidateCard key={candidate.candidateName} candidate={candidate} rank={index + 1} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Chart */}
          <div className="saas-card p-6">
            <h4
              className="text-sm font-bold mb-6 pb-3 uppercase tracking-wider"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)', fontFamily: "'Inter', sans-serif" }}
            >
              Score Distribution
            </h4>
            <RadialScoreChart data={chartData} />
          </div>

          {/* Verdict Summary */}
          <div className="saas-card p-6">
            <h4 className="text-sm font-bold mb-6 pb-3 uppercase tracking-wider" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)', fontFamily: "'Inter', sans-serif" }}>Verdict Summary</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>Strong Fits</span>
                <span
                  className="px-2 py-1 rounded font-black"
                  style={{ background: 'var(--accent-primary)', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}
                >
                  {fitCounts['Strong Fit'] || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>Moderate Fits</span>
                <span
                  className="px-2 py-1 rounded font-black"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', fontFamily: "'Inter', sans-serif" }}
                >
                  {fitCounts['Moderate Fit'] || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>Not Fit</span>
                <span
                  className="px-2 py-1 rounded font-black"
                  style={{ background: 'var(--badge-weak-bg)', color: 'var(--badge-weak-text)', border: '1px solid var(--badge-weak-border)', fontFamily: "'Inter', sans-serif" }}
                >
                  {fitCounts['Not Fit'] || 0}
                </span>
              </div>
            </div>
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <p className="text-[10px] italic leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: "'Lora', serif" }}>
                "AI recommendation engine identifies {bestCandidate?.candidateName} as the primary choice for this role with exceptional alignment."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JDInput from '../components/JDInput';
import ResumeDropzone from '../components/ResumeDropzone';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeResumes } from '../services/api';
import { TbBolt } from 'react-icons/tb';
import { HiExclamationTriangle, HiCheck, HiDocumentText, HiArrowUpTray } from 'react-icons/hi2';
import { FaRegCircle } from 'react-icons/fa';

type PageState = 'input' | 'loading' | 'error';

const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();

  // ── Input State ────────────────────────────────────────────
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);

  // ── Page State ─────────────────────────────────────────────
  const [pageState, setPageState] = useState<PageState>('input');
  const [errorMsg, setErrorMsg] = useState('');

  // ── Validation ─────────────────────────────────────────────
  const isReady =
    (jdText.trim().length > 20 || jdFile !== null) && resumeFiles.length > 0;

  // ── Analyze Handler ────────────────────────────────────────
  const handleAnalyze = async () => {
    setPageState('loading');
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const response = await analyzeResumes(jdText, jdFile, resumeFiles);
      navigate('/results', { state: { candidates: response.candidates } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        'Analysis failed. Check the server is running and your GEMINI_API_KEY is set.';
      setErrorMsg(msg);
      setPageState('error');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
      {/* ── Loading State ─────────────────────────────────────── */}
      {pageState === 'loading' && (
        <div className="min-h-[60vh] pt-16 flex items-center justify-center animate-fade-in">
          <LoadingSpinner />
        </div>
      )}

      {/* ── Input State ───────────────────────────────────────── */}
      {(pageState === 'input' || pageState === 'error') && (
        <div className="space-y-10 animate-fade-in-up">
          {/* Page Header */}
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{
                background: 'rgba(160, 82, 45, 0.08)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(160, 82, 45, 0.15)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <HiDocumentText size={14} /> Setup Analysis
            </div>
            <h1
              className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
            >
              Configure your <span className="gradient-text">screening.</span>
            </h1>
            <p
              className="text-base lg:text-lg leading-relaxed"
              style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif" }}
            >
              Add your job description and upload candidate resumes to begin the AI-powered analysis.
            </p>
          </div>

          {/* Main Action Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <JDInput
                  jdText={jdText}
                  jdFile={jdFile}
                  onTextChange={setJdText}
                  onFileChange={setJdFile}
                />
                <ResumeDropzone files={resumeFiles} onFilesChange={setResumeFiles} />
              </div>

              {/* Mobile CTA */}
              <div className="lg:hidden space-y-6">
                {pageState === 'error' && <ErrorBanner msg={errorMsg} />}
                <div className="flex flex-col items-center gap-4">
                  <AnalyzeButton isReady={isReady} count={resumeFiles.length} onClick={handleAnalyze} />
                  {!isReady && <ValidationHints jdText={jdText} jdFile={jdFile} count={resumeFiles.length} />}
                </div>
              </div>
            </div>

            {/* Sidebar (Desktop) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
              <div className="saas-card p-8 space-y-6">
                <h3
                  className="font-bold text-lg pb-4"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                >
                  Review & Launch
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }} className="font-medium">Job Description</span>
                    <span
                      className="font-bold flex items-center gap-1"
                      style={{ color: jdText || jdFile ? 'var(--accent-primary)' : 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {jdText || jdFile ? <><HiCheck size={12} /> Ready</> : <><FaRegCircle size={10} /> Missing</>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }} className="font-medium">Total Resumes</span>
                    <span
                      className="font-bold flex items-center gap-1"
                      style={{ color: resumeFiles.length > 0 ? 'var(--accent-primary)' : 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {resumeFiles.length > 0 ? <><HiCheck size={12} /> {resumeFiles.length} Queue</> : <><FaRegCircle size={10} /> Missing</>}
                    </span>
                  </div>
                </div>

                {pageState === 'error' && <ErrorBanner msg={errorMsg} />}

                <div className="pt-2">
                  <AnalyzeButton isReady={isReady} count={resumeFiles.length} onClick={handleAnalyze} />
                </div>

                {!isReady && <ValidationHints jdText={jdText} jdFile={jdFile} count={resumeFiles.length} />}
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(160, 82, 45, 0.04)',
                  border: '1px solid rgba(160, 82, 45, 0.1)',
                }}
              >
                <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--accent-primary)', fontStyle: 'italic', fontFamily: "'Lora', serif" }}>
                  "AI screening significantly reduces time-to-hire by automatically identifying relevant experience matches."
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h3
              className="font-bold text-lg mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--text-primary)' }}
            >
              Quick Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <HiDocumentText size={18} />, tip: 'Be specific in your JD — mention exact skills, frameworks, and experience levels for the best AI matching.' },
                { icon: <HiArrowUpTray size={18} />, tip: 'Upload multiple resumes at once. Our AI handles batch processing and ranks all candidates together.' },
                { icon: <TbBolt size={18} />, tip: 'Results include actionable insights — strengths, gaps, and a clear recommendation for each candidate.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(160, 82, 45, 0.08), rgba(196, 149, 106, 0.08))',
                      border: '1px solid rgba(160, 82, 45, 0.12)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif" }}>
                    {item.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

// ── Sub-components ─────────────────────────────────────────

const AnalyzeButton: React.FC<{ isReady: boolean; count: number; onClick: () => void }> = ({ isReady, count, onClick }) => (
  <button
    id="analyze-btn"
    onClick={onClick}
    disabled={!isReady}
    className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
  >
    <TbBolt size={18} />
    {isReady
      ? `Analyze ${count} Resume${count !== 1 ? 's' : ''}`
      : 'Complete Setup'}
  </button>
);

const ErrorBanner: React.FC<{ msg: string }> = ({ msg }) => (
  <div
    className="p-4 rounded-xl flex items-start gap-3"
    style={{
      background: 'var(--badge-weak-bg)',
      border: '1px solid var(--badge-weak-border)',
    }}
  >
    <HiExclamationTriangle size={20} className="shrink-0" style={{ color: 'var(--badge-weak-text)' }} />
    <div className="min-w-0 flex-1">
      <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--badge-weak-text)', fontFamily: "'Inter', sans-serif" }}>Analysis Failed</p>
      <p className="text-sm break-words" style={{ color: 'var(--badge-weak-text)', fontFamily: "'Lora', serif" }}>{msg}</p>
    </div>
  </div>
);

const ValidationHints: React.FC<{ jdText: string; jdFile: File | null; count: number }> = ({ jdText, jdFile, count }) => (
  <ul className="space-y-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
    {(!jdText.trim() && !jdFile) && (
      <li className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
        Add a brief job description
      </li>
    )}
    {jdText.trim().length > 0 && jdText.trim().length < 20 && (
      <li className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--badge-moderate-text)', fontFamily: "'Inter', sans-serif" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--badge-moderate-text)' }} />
        Description is a bit too short
      </li>
    )}
    {count === 0 && (
      <li className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
        Upload at least one candidate resume
      </li>
    )}
  </ul>
);

export default AnalyzePage;

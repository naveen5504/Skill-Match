import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultsDashboard from '../components/ResultsDashboard';
import type { CandidateAnalysis } from '../types';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const candidates = (location.state as { candidates?: CandidateAnalysis[] })?.candidates;

  // ── Redirect if no data ────────────────────────────────────
  useEffect(() => {
    if (!candidates || candidates.length === 0) {
      navigate('/analyze', { replace: true });
    }
  }, [candidates, navigate]);

  if (!candidates || candidates.length === 0) {
    return null;
  }

  const handleNewAnalysis = () => {
    navigate('/analyze');
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
      <div className="animate-fade-in-up">
        <ResultsDashboard candidates={candidates} onReset={handleNewAnalysis} />
      </div>
    </main>
  );
};

export default ResultsPage;

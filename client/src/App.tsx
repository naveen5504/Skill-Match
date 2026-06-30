import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import ResultsPage from './pages/ResultsPage';
import { VscGithubInverted } from 'react-icons/vsc';
import { HiHome, HiDocumentMagnifyingGlass } from 'react-icons/hi2';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home', icon: <HiHome size={16} /> },
    { path: '/analyze', label: 'Dashboard', icon: <HiDocumentMagnifyingGlass size={16} /> },
  ];

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* ── Navigation ──────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 w-full backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--bg-nav)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            className="flex items-center gap-3 cursor-pointer bg-transparent border-none p-0"
            onClick={() => navigate('/')}
            title="Go to Home"
            style={{ outline: 'none' }}
          >
            <img src="/vite.svg" className="w-8 h-8" alt="Logo" />
            <span
              className="font-bold text-xl tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)' }}
            >
              Skill<span className="gradient-text" style={{ fontStyle: 'italic' }}>Match</span>
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || 
                (link.path === '/analyze' && location.pathname === '/results');
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="nav-link-btn"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(160, 82, 45, 0.08)' : 'transparent',
                    borderColor: isActive ? 'rgba(160, 82, 45, 0.15)' : 'transparent',
                  }}
                >
                  {link.icon}
                  <span className="hidden sm:inline">{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Main Content (Routes) ────────────────────────────── */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="mt-20 py-16 px-6"
        style={{
          borderTop: '1px solid var(--border-primary)',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
          {/* Large Outline Title */}
          <h2 className="footer-outline-text">SkillMatch</h2>

          {/* Tagline */}
          <p className="text-base max-w-md" style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif", fontStyle: 'italic' }}>
            AI-powered resume screening platform built with precision
          </p>

          {/* Built By */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              Built by
            </span>
            <a
              href="https://github.com/Garvgoel23"
              target="_blank"
              rel="noopener noreferrer"
              title="Garvgoel23"
            >
              <img
                src="https://github.com/Garvgoel23.png"
                alt="Garvgoel23"
                className="footer-avatar"
              />
            </a>
          </div>

          {/* Source Button */}
          <a
            href="https://github.com/Garvgoel23/AI-Resume-Screening-System"
            target="_blank"
            rel="noopener noreferrer"
            className="source-btn"
          >
            <VscGithubInverted size={18} />
            Source
          </a>

          {/* Copyright */}
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
            © 2026 All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSparkles, HiArrowRight } from 'react-icons/hi2';
import { TbTargetArrow, TbBolt, TbDiamond } from 'react-icons/tb';

// ── Typewriter Component ────────────────────────────────────
const Typewriter: React.FC<{ text: string; delay?: number; startDelay?: number }> = ({ text, delay = 60, startDelay = 0 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const mainTimeout = setTimeout(() => setIsStarted(true), startDelay);
    return () => clearTimeout(mainTimeout);
  }, [startDelay]);

  useEffect(() => {
    if (isStarted && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text, isStarted]);

  return (
    <span>
      {currentText}
      {isStarted && currentIndex < text.length && (
        <span className="cursor-blink inline-block w-[3px] h-[1em] ml-1 align-middle" style={{ background: 'var(--accent-primary)' }} />
      )}
    </span>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/analyze');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="space-y-20 animate-fade-in-up">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl px-8 py-16 lg:py-24 lg:px-16" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
            <div className="hero-gradient-bg" />
            <div className="relative z-10 max-w-3xl">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                style={{
                  background: 'rgba(160, 82, 45, 0.08)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(160, 82, 45, 0.15)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <HiSparkles size={14} /> AI-Powered Recruitment
              </div>

              <h1
                className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
              >
                <Typewriter text="Hire smarter with" delay={50} />
                <br />
                <span className="gradient-text inline-block mt-3">
                  <Typewriter text="data-driven insights." delay={60} startDelay={1000} />
                </span>
              </h1>

              <p
                className="text-lg lg:text-xl max-w-2xl leading-relaxed mb-12"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif" }}
              >
                Stop manual screening. Let our advanced AI analyze multiple resumes against your job description in seconds and identify your top performers.
              </p>

              <button
                className="get-started-pill flex items-center gap-2.5"
                onClick={handleGetStarted}
              >
                <span className="pill-dot" />
                Get Started
                <HiArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <TbTargetArrow size={22} />, title: 'Precision Scoring', desc: 'Weighted matching aligned to your JD requirements' },
              { icon: <TbBolt size={22} />, title: 'Instant Ranking', desc: 'Identify top candidates in seconds, not hours' },
              { icon: <TbDiamond size={22} />, title: 'Actionable Insights', desc: 'Clear breakdown of strengths & skill gaps' },
            ].map((feature, i) => (
              <div
                key={i}
                className="feature-card animate-fade-in-up"
                style={{ animationDelay: `${i * 150}ms`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3
                  className="font-semibold text-base mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif" }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* How It Works Section */}
          <div className="text-center space-y-12">
            <div>
              <h2
                className="text-3xl lg:text-4xl font-bold tracking-tight mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
              >
                How it <span className="gradient-text">works</span>
              </h2>
              <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif" }}>
                Three simple steps to find your perfect candidate match.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Describe the Role', desc: 'Paste your job description or upload a PDF with all the requirements.' },
                { step: '02', title: 'Upload Resumes', desc: 'Drag and drop candidate resumes in bulk — we handle the parsing.' },
                { step: '03', title: 'Get Rankings', desc: 'AI scores, ranks, and provides actionable insights for every candidate.' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative p-8 rounded-2xl animate-fade-in-up"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    animationDelay: `${i * 200}ms`,
                    opacity: 0,
                    animationFillMode: 'forwards',
                  }}
                >
                  <div
                    className="text-5xl font-black mb-4"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      color: 'var(--border-secondary)',
                      opacity: 0.5,
                    }}
                  >
                    {item.step}
                  </div>
                  <h3
                    className="font-semibold text-lg mb-2"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Lora', serif" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <button
              className="get-started-pill flex items-center gap-2.5 mx-auto"
              onClick={handleGetStarted}
            >
              <span className="pill-dot" />
              Start Screening Now
              <HiArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default LandingPage;

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiDocumentText, HiDocumentCheck, HiFolderOpen, HiArrowDownTray, HiLightBulb } from 'react-icons/hi2';

interface JDInputProps {
  jdText: string;
  jdFile: File | null;
  onTextChange: (text: string) => void;
  onFileChange: (file: File | null) => void;
}

const JDInput: React.FC<JDInputProps> = ({ jdText, jdFile, onTextChange, onFileChange }) => {
  const [mode, setMode] = useState<'text' | 'pdf'>('text');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <div className="saas-card p-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 pb-4"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-3 min-w-[150px] flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: 'rgba(160, 82, 45, 0.08)',
              border: '1px solid rgba(160, 82, 45, 0.15)',
              color: 'var(--accent-primary)',
            }}
          >
            <HiDocumentText size={20} />
          </div>
          <div className="min-w-0">
            <h2
              className="font-bold text-lg tracking-tight truncate"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
            >
              Job Description
            </h2>
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              Paste text or upload PDF
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div
          className="flex p-1 rounded-lg shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
        >
          {(['text', 'pdf'] as const).map((m) => (
            <button
              key={m}
              id={`jd-mode-${m}`}
              onClick={() => {
                setMode(m);
                if (m === 'text') onFileChange(null);
                if (m === 'pdf') onTextChange('');
              }}
              className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200"
              style={{
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === m ? 'var(--shadow-card)' : 'none',
                border: mode === m ? '1px solid var(--border-primary)' : '1px solid transparent',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {m === 'text' ? 'Text Input' : 'PDF Upload'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-[240px]">
        {mode === 'text' && (
          <textarea
            id="jd-textarea"
            value={jdText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Paste your job description here. Mention key skills (e.g., React, Node.js, Python) for optimal matching accuracy."
            className="input-field h-full min-h-[240px] resize-none text-sm leading-relaxed"
          />
        )}

        {mode === 'pdf' && (
          <div
            {...getRootProps()}
            id="jd-pdf-dropzone"
            className="h-full min-h-[240px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-200 group"
            style={{
              borderColor: isDragActive
                ? 'var(--accent-primary)'
                : jdFile
                ? 'var(--badge-strong-border)'
                : 'var(--border-secondary)',
              background: isDragActive
                ? 'rgba(160, 82, 45, 0.04)'
                : jdFile
                ? 'var(--badge-strong-bg)'
                : 'transparent',
            }}
          >
            <input {...getInputProps()} id="jd-pdf-input" />
            {jdFile ? (
              <div className="text-center space-y-4 animate-fade-in">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto"
                  style={{
                    background: 'var(--badge-strong-bg)',
                    border: '1px solid var(--badge-strong-border)',
                    color: 'var(--badge-strong-text)',
                  }}
                >
                  <HiDocumentCheck size={28} />
                </div>
                <div>
                  <p className="font-bold text-sm truncate max-w-[200px] mx-auto" style={{ color: 'var(--badge-strong-text)' }}>
                    {jdFile.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                    {(jdFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  id="jd-pdf-remove"
                  onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--badge-weak-text)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3 group-hover:scale-105 transition-transform duration-300">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {isDragActive ? <HiFolderOpen size={28} /> : <HiArrowDownTray size={28} />}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {isDragActive ? 'Drop JD PDF here' : 'Click or drag JD PDF'}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                    Max 10 MB • PDF Only
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-2">
        <p
          className="text-[10px] font-medium leading-tight text-center p-2 rounded-lg"
          style={{
            color: 'var(--text-muted)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <HiLightBulb size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: 'var(--accent-warm)' }} /> Clear, concise descriptions with specific requirements result in the highest AI matching accuracy.
        </p>
      </div>
    </div>
  );
};

export default JDInput;

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiUsers, HiFolderOpen, HiPaperClip, HiXMark, HiLockClosed } from 'react-icons/hi2';

interface ResumeDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({ files, onFilesChange }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const existing = new Set(files.map((f) => f.name));
      const newFiles = acceptedFiles.filter((f) => !existing.has(f.name));
      onFilesChange([...files, ...newFiles]);
    },
    [files, onFilesChange]
  );

  const removeFile = (name: string) => {
    onFilesChange(files.filter((f) => f.name !== name));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  return (
    <div className="saas-card p-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: 'rgba(139, 110, 90, 0.1)',
              border: '1px solid rgba(139, 110, 90, 0.18)',
              color: 'var(--accent-secondary)',
            }}
          >
            <HiUsers size={20} />
          </div>
          <div className="min-w-0">
            <h2
              className="font-bold text-lg tracking-tight truncate"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-primary)', fontStyle: 'italic' }}
            >
              Candidate Resumes
            </h2>
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              Bulk upload PDFs
            </p>
          </div>
        </div>
        {files.length > 0 && (
          <div
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider animate-fade-in shrink-0 self-start xl:self-auto"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {files.length} {files.length === 1 ? 'Resume' : 'Resumes'}
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div className="space-y-4 flex-1">
        <div
          {...getRootProps()}
          id="resume-dropzone"
          className="relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-200 group"
          style={{
            borderColor: isDragActive ? 'var(--accent-primary)' : 'var(--border-secondary)',
            background: isDragActive ? 'rgba(160, 82, 45, 0.04)' : 'transparent',
          }}
        >
          <input {...getInputProps()} id="resume-file-input" />
          <div className="text-center space-y-3 group-hover:scale-105 transition-transform duration-300">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                color: 'var(--accent-secondary)',
              }}
            >
              {isDragActive ? <HiFolderOpen size={28} /> : <HiPaperClip size={28} />}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {isDragActive ? 'Release to upload' : 'Click or drag resumes'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 px-4" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                PDF format • Up to 10 MB per file
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                Queued for Analysis
              </span>
              <button
                onClick={() => onFilesChange([])}
                className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--badge-weak-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {files.map((file, i) => (
                <div
                  key={file.name + i}
                  className="flex items-center justify-between rounded-xl px-4 py-3 group/item transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-muted)',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    id={`remove-resume-${i}`}
                    onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: 'var(--text-muted)', border: '1px solid transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--badge-weak-text)';
                      e.currentTarget.style.background = 'var(--badge-weak-bg)';
                      e.currentTarget.style.borderColor = 'var(--badge-weak-border)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    title="Remove"
                  >
                    <HiXMark size={16} />
                  </button>
                </div>
              ))}
            </div>
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
          <HiLockClosed size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: 'var(--accent-secondary)' }} /> Your files are processed securely and deleted immediately after the analysis session ends.
        </p>
      </div>
    </div>
  );
};

export default ResumeDropzone;

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';

interface ExportGitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportGitHubPagesModal: React.FC<ExportGitHubPagesModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const buildCommands = [
    {
      title: '1. Build the production static bundle',
      cmd: 'npm run build',
      description: 'Generates static HTML, JS, CSS, and assets in the /dist folder with relative asset paths configured for GitHub Pages (base: "./").',
    },
    {
      title: '2. Deploy using gh-pages package (Optional quick method)',
      cmd: 'npx gh-pages -d dist',
      description: 'Automatically pushes the generated dist directory to your repository gh-pages branch.',
    },
    {
      title: '3. Enable GitHub Pages in your Repository Settings',
      cmd: 'Settings > Pages > Build and deployment > Source: Deploy from a branch (gh-pages / root)',
      description: 'GitHub will serve your site directly at https://<username>.github.io/<repository-name>/',
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="glass-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,242,254,0.2)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="export-modal-title" className="text-lg font-bold text-white">GitHub Pages Export &amp; Hosting Guide</h2>
              <p className="text-xs text-slate-400">Zero-config static deployment instructions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white rounded-lg glass-panel cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-white block mb-0.5">Pre-Configured Relative Base</strong>
              <code>vite.config.ts</code> has already been configured with <code>base: './'</code>. This guarantees that all script files, stylesheets, and original SkillConnect logo assets load without 404 path errors on any GitHub Pages repository URL subpath.
            </div>
          </div>

          <div className="space-y-4">
            {buildCommands.map((step, idx) => (
              <div key={idx} className="glass-panel p-4 rounded-xl border border-white/5 space-y-2">
                <div className="font-semibold text-white">{step.title}</div>
                <p className="text-slate-400 text-[11px]">{step.description}</p>
                <div className="flex items-center justify-between bg-black/60 rounded-lg px-3 py-2 border border-white/5 font-mono text-[11px] text-cyan-300">
                  <span className="truncate mr-2">{step.cmd}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(step.cmd, idx)}
                    className="p-1 hover:text-white text-slate-400 shrink-0 cursor-pointer"
                    aria-label={`Copy ${step.title}`}
                    title="Copy command"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 cursor-pointer shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

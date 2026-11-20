import React, { useState, useEffect } from 'react';
import { PageView } from '../types';
import { LEGAL_TEXTS, BRAND_CONFIG } from '../data/websiteContent';
import { getViewPath, handleSpaLinkClick } from '../utils/seoRouting';
import { Shield, FileText, AlertCircle, Copy, Check } from 'lucide-react';

interface LegalSectionProps {
  initialTab: 'privacy' | 'terms' | 'disclaimer';
  onNavigate?: (view: PageView) => void;
}

export const LegalSection: React.FC<LegalSectionProps> = ({ initialTab, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'disclaimer'>(initialTab);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const getContent = () => {
    switch (activeTab) {
      case 'privacy':
        return LEGAL_TEXTS.privacyPolicy;
      case 'terms':
        return LEGAL_TEXTS.termsConditions;
      case 'disclaimer':
        return LEGAL_TEXTS.disclaimer;
    }
  };

  const currentDoc = getContent();

  const handleCopyText = () => {
    const textToCopy = `${currentDoc.title} - SkillConnect
Last Updated: ${currentDoc.lastUpdated}
Founder: ${BRAND_CONFIG.founder} (${BRAND_CONFIG.founderEmail})

${currentDoc.sections.map((s) => `${s.heading}\n${s.body}`).join('\n\n')}
`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <nav aria-label="Legal Documents" className="flex flex-wrap items-center gap-2 p-1 glass-panel rounded-2xl">
            <a
              href={getViewPath('privacy')}
              onClick={(e) => {
                if (onNavigate) {
                  handleSpaLinkClick(e, 'privacy', onNavigate);
                } else {
                  e.preventDefault();
                  setActiveTab('privacy');
                }
              }}
              aria-current={activeTab === 'privacy' ? 'page' : undefined}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </a>
            <a
              href={getViewPath('terms')}
              onClick={(e) => {
                if (onNavigate) {
                  handleSpaLinkClick(e, 'terms', onNavigate);
                } else {
                  e.preventDefault();
                  setActiveTab('terms');
                }
              }}
              aria-current={activeTab === 'terms' ? 'page' : undefined}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'terms'
                  ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms & Conditions</span>
            </a>
            <a
              href={getViewPath('disclaimer')}
              onClick={(e) => {
                if (onNavigate) {
                  handleSpaLinkClick(e, 'disclaimer', onNavigate);
                } else {
                  e.preventDefault();
                  setActiveTab('disclaimer');
                }
              }}
              aria-current={activeTab === 'disclaimer' ? 'page' : undefined}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'disclaimer'
                  ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Disclaimer</span>
            </a>
          </nav>

          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 glass-card hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Full Document' : 'Copy Document'}</span>
          </button>
        </div>

        {/* Legal Document Display Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-cyan-500/20 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentDoc.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span>Last Modified: <strong className="text-slate-200">{currentDoc.lastUpdated}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Platform: <strong className="text-cyan-300">SkillConnect Official</strong></span>
              <span aria-hidden="true">·</span>
              <span>Founder: <strong className="text-slate-200">{BRAND_CONFIG.founder}</strong></span>
            </div>
          </div>

          <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
            {currentDoc.sections.map((section, idx) => (
              <div key={idx} className="border-t border-white/5 pt-6 first:border-0 first:pt-0">
                <h2 className="text-base font-bold text-white mb-2">
                  {section.heading}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 gap-4">
            <div>
              For legal questions, email: <a href={`mailto:${BRAND_CONFIG.founderEmail}`} className="text-cyan-300 underline font-mono">{BRAND_CONFIG.founderEmail}</a>
            </div>
            <div>
              © 2026 SkillConnect. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

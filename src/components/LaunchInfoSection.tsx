import React, { useState } from 'react';
import { PageView } from '../types';
import { BRAND_CONFIG } from '../data/websiteContent';
import { useCMS } from '../context/CMSContext';
import { getViewPath, handleSpaLinkClick } from '../utils/seoRouting';
import {
  Rocket,
  CheckCircle2,
  ShieldAlert,
  Smartphone,
  Globe,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface LaunchInfoSectionProps {
  onNavigate: (view: PageView) => void;
  isStandalonePage?: boolean;
}

export const LaunchInfoSection: React.FC<LaunchInfoSectionProps> = ({
  onNavigate,
  isStandalonePage = false,
}) => {
  const HeadingTag = isStandalonePage ? 'h1' : 'h2';
  const SubHeadingTag = isStandalonePage ? 'h2' : 'h3';
  const FaqQuestionTag = isStandalonePage ? 'h3' : 'h4';
  const { activeConfig } = useCMS();
  const isLive = Date.now() >= BRAND_CONFIG.launchTimestamp;
  const faqs = activeConfig.faqs || [];
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  const milestones = [
    {
      phase: 'Phase 1 · Complete',
      title: 'Platform Architecture & Security Blueprint',
      description: 'Specification of cryptographic peer verification, zero-leak identity vaults, and database schemas by Abhishek Singh.',
      date: 'Q1 - Q2 2026',
      status: 'completed',
    },
    {
      phase: 'Phase 2 · Active',
      title: 'Official Web Presence & Static Infrastructure',
      description: 'Public release of the official SkillConnect website, brand identity preservation, and community inquiry channel.',
      date: 'October 2026',
      status: 'active',
    },
    {
      phase: 'Phase 3 · Complete',
      title: 'Closed Beta & Peer Testing Cohort',
      description: 'Invitation-only pilot with selected students, freelance developers, and mentors to stress-test real-time session flows.',
      date: 'Late October 2026',
      status: isLive ? 'completed' : 'upcoming',
    },
    {
      phase: isLive ? 'Phase 4 · Released' : 'Phase 4 · Official Release',
      title: isLive ? 'App is Live on Google Play Store' : 'Global Platform Public Launch',
      description: isLive
        ? 'SkillConnect is now live! The official Android application is available on Google Play Store and all platform features are working.'
        : 'Full public rollout of SkillConnect web application and official Google Play Store Android release.',
      date: '8 November 2026',
      status: isLive ? 'live' : 'launch',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Release Engineering & Schedule
          </div>
          <HeadingTag className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Launch Announcement: {activeConfig.homepage.launchDateString || '8 November 2026'}
          </HeadingTag>
          <p className="text-base text-slate-300 mt-4 leading-relaxed">
            SkillConnect is adhering to a disciplined, transparent release roadmap led by Founder & Developer Abhishek Singh to connect customers, skilled service providers, and companies across India starting 8 November 2026.
          </p>
        </div>

        {/* Milestone Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`glass-card rounded-2xl p-6 border flex flex-col justify-between ${
                m.status === 'launch'
                  ? 'border-cyan-400/50 shadow-[0_0_30px_rgba(0,242,254,0.2)] bg-slate-900/90'
                  : m.status === 'active'
                  ? 'border-purple-400/40 bg-slate-900/70'
                  : 'border-white/5 bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span
                    className={`font-semibold uppercase tracking-wider ${
                      m.status === 'launch'
                        ? 'text-cyan-400'
                        : m.status === 'active'
                        ? 'text-purple-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {m.phase}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{m.date}</span>
                </div>

                <SubHeadingTag className="text-base font-bold text-white mb-2 tracking-tight">
                  {m.title}
                </SubHeadingTag>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-2 text-xs">
                {m.status === 'completed' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {m.status === 'active' && (
                  <span className="text-purple-300 font-semibold flex items-center gap-1">
                    ● Current Stage
                  </span>
                )}
                {m.status === 'upcoming' && (
                  <span className="text-slate-400 flex items-center gap-1">
                    ○ Scheduled
                  </span>
                )}
                {m.status === 'launch' && (
                  <span className="text-cyan-300 font-bold flex items-center gap-1">
                    <Rocket className="w-3.5 h-3.5" /> Official Launch
                  </span>
                )}
                {m.status === 'live' && (
                  <a
                    href={BRAND_CONFIG.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> App Live on Play Store
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Platform Targets & Safety Advisory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/20 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <SubHeadingTag className="text-lg font-bold text-white mb-2">Supported Platforms</SubHeadingTag>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Android Application:</strong>{' '}
                    {isLive ? (
                      <span className="text-emerald-300 font-semibold">Available now on Google Play Store.</span>
                    ) : (
                      'Official release via the Google Play Store on 8 November 2026.'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Modern Web Client:</strong> Responsive, high-speed Progressive Web Architecture accessible from any desktop or mobile browser.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <a
                href={getViewPath('contact')}
                onClick={(e) => handleSpaLinkClick(e, 'contact', onNavigate)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 cursor-pointer min-h-[44px]"
              >
                <span>Request Early Beta Notification</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-purple-500/20 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
              </div>
              <SubHeadingTag className="text-lg font-bold text-white mb-2">Official Security Notice</SubHeadingTag>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                SkillConnect does NOT provide third-party APK mirrors or unsigned binaries. Any website or channel offering an unofficial APK prior to 8 November 2026 is unauthorized and potentially malicious.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Always verify that your communication is routed through this official portal or directly with founder Abhishek Singh (<span className="text-slate-300 font-mono">{activeConfig.contact.founderEmail}</span>).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-slate-400">
              Verified domain: <span className="text-cyan-400 font-mono">skillconnectofficial.cloud.run</span>
            </div>
          </div>
        </div>

        {/* Live CMS-Managed Frequently Asked Questions (FAQs) */}
        {faqs.length > 0 && (
          <div className="mt-16 pt-14 border-t border-white/10">
            <div className="max-w-3xl mb-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <SubHeadingTag className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                SkillConnect Official Platform FAQs
              </SubHeadingTag>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Answers to common questions from customers, skilled service providers, and community testers across India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                const panelId = `faq-panel-${faq.id}`;
                return (
                  <div
                    key={faq.id}
                    className={`glass-card rounded-2xl border transition-all ${
                      isOpen
                        ? 'border-cyan-400/50 bg-slate-900/90 shadow-[0_0_25px_rgba(0,242,254,0.12)]'
                        : 'border-white/10 bg-slate-900/50 hover:border-cyan-500/30'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-5 text-left flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono text-cyan-300 uppercase">
                          {faq.category}
                        </span>
                        <FaqQuestionTag className="text-sm font-bold text-white leading-snug">
                          {faq.question}
                        </FaqQuestionTag>
                      </div>
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-4 h-4 text-cyan-400 shrink-0 mt-1 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div
                        id={panelId}
                        className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

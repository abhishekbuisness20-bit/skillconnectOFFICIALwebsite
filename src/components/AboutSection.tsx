import React from 'react';
import { PageView } from '../types';
import { Code2, Target, Lightbulb, UserCheck, ShieldCheck, ArrowUpRight, Shield, Instagram } from 'lucide-react';
import { BRAND_CONFIG, ADMINISTRATION_MEMBERS } from '../data/websiteContent';
import { useCMS } from '../context/CMSContext';
import { getViewPath, handleSpaLinkClick } from '../utils/seoRouting';

interface AboutSectionProps {
  onNavigate: (view: PageView) => void;
  isStandalonePage?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onNavigate,
  isStandalonePage = false,
}) => {
  const HeadingTag = isStandalonePage ? 'h1' : 'h2';
  const SubHeadingTag = isStandalonePage ? 'h2' : 'h3';
  const { activeConfig } = useCMS();
  const pillars = activeConfig.about.pillars;

  const getPillarIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Target className="w-5 h-5 text-cyan-400" />;
      case 1:
        return <Lightbulb className="w-5 h-5 text-purple-400" />;
      case 2:
        return <Code2 className="w-5 h-5 text-cyan-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            {activeConfig.about.kicker}
          </div>
          <HeadingTag className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {activeConfig.about.heading}
          </HeadingTag>
          <p className="text-base sm:text-lg text-slate-300 mt-4 leading-relaxed">
            {activeConfig.about.introParagraph}
          </p>
        </div>

        {/* 2-Column Grid: Founder Bio & Core Principles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Founder Profile & Administration Members Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Founder Profile Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(0,242,254,0.3)] shrink-0">
                  <div className="w-full h-full bg-[#070b1e] rounded-[14px] flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <SubHeadingTag className="text-xl font-bold text-white tracking-tight">
                    {BRAND_CONFIG.founder}
                  </SubHeadingTag>
                  <p className="text-xs text-cyan-400 font-medium">
                    {BRAND_CONFIG.founderRole}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    SkillConnect Platform Architect
                  </p>
                </div>
              </div>

              {/* Founder Social Account */}
              <div className="mb-6">
                <a
                  href={activeConfig.contact.founderInstagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 hover:border-pink-500/40 transition-colors"
                  title="Founder & Developer Abhishek Singh on Instagram"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span className="font-mono text-xs">{activeConfig.contact.founderInstagramHandle}</span>
                </a>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>"{activeConfig.about.founderQuote1}"</p>
                <p>"{activeConfig.about.founderQuote2}"</p>
              </div>

              {/* Direct Contact Button */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Direct Inquiries:
                  <div className="text-slate-200 font-mono text-[11px] truncate mt-0.5">
                    {activeConfig.contact.founderEmail}
                  </div>
                </div>
                <a
                  href={getViewPath('contact')}
                  onClick={(e) => handleSpaLinkClick(e, 'contact', onNavigate)}
                  className="px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:text-white glass-panel rounded-lg hover:border-cyan-400/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Write to Abhishek</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Administration Members directly below Founder & Developer */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
                    Platform Administration
                  </div>
                  <SubHeadingTag className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                    <Shield className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    <span>Administration Members</span>
                  </SubHeadingTag>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  SkillConnect Team
                </span>
              </div>

              <div className="space-y-3">
                {ADMINISTRATION_MEMBERS.map((member) => (
                  <div
                    key={member.name}
                    className="glass-panel rounded-2xl p-4 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 text-sm shadow-[0_0_10px_rgba(0,242,254,0.15)] shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white tracking-tight">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-medium">
                          {member.role}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {member.department}
                        </div>
                      </div>
                    </div>
                    <a
                      href={member.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/25 hover:border-pink-500/40 transition-colors self-start sm:self-auto shrink-0"
                      title={`${member.name} on Instagram`}
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      <span className="font-mono text-[11px]">{member.instagramHandle}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Core Architectural Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className={`glass-card rounded-2xl p-6 border border-white/5 ${
                  idx % 2 === 0 ? 'hover:border-cyan-500/30' : 'hover:border-purple-500/30'
                } transition-all`}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${
                    idx % 2 === 0
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-purple-500/10 border-purple-500/30'
                  } border flex items-center justify-center mb-4`}
                >
                  {getPillarIcon(idx)}
                </div>
                <SubHeadingTag className="text-base font-bold text-white mb-2">{pillar.title}</SubHeadingTag>
                <p className="text-xs text-slate-300 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

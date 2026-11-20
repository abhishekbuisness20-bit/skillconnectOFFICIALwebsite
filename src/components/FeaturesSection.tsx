import React, { useState } from 'react';
import { PageView, FeatureStatus } from '../types';
import { BRAND_CONFIG } from '../data/websiteContent';
import { useCMS } from '../context/CMSContext';
import { 
  Users, 
  Award, 
  Compass, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Layers,
  Sparkles
} from 'lucide-react';
import { SkillSearchInsights } from './SkillSearchInsights';

interface FeaturesSectionProps {
  onNavigate?: (view: PageView) => void;
  onOpenCustomerModal?: (actionType: string, targetFeature?: string, defaultDetails?: string) => void;
  isStandalonePage?: boolean;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  onNavigate,
  onOpenCustomerModal,
  isStandalonePage = false,
}) => {
  const HeadingTag = isStandalonePage ? 'h1' : 'h2';
  const SubHeadingTag = isStandalonePage ? 'h2' : 'h3';
  const { activeConfig } = useCMS();
  const [selectedFilter, setSelectedFilter] = useState<'all' | FeatureStatus>('all');
  const isLive = Date.now() >= BRAND_CONFIG.launchTimestamp;
  const servicesList = activeConfig.services;

  const filteredFeatures = selectedFilter === 'all'
    ? servicesList
    : servicesList.filter((f) => f.status === selectedFilter);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-5 h-5 text-cyan-400" />;
      case 'Award':
        return <Award className="w-5 h-5 text-purple-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-cyan-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-purple-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-cyan-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      default:
        return <Layers className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusBadge = (status: FeatureStatus) => {
    if (isLive && status === 'Launch Feature (8 Nov 2026)') {
      return (
        <span className="text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Live & Active Now</span>
        </span>
      );
    }

    switch (status) {
      case 'Core Architecture':
        return (
          <span className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Ready in Core Architecture</span>
          </span>
        );
      case 'Launch Feature (8 Nov 2026)':
        return (
          <span className="text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Available at Launch (8 Nov 2026)</span>
          </span>
        );
      case 'In Development (Post-Launch)':
        return (
          <span className="text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 whitespace-nowrap">
            <Layers className="w-3 h-3 text-purple-400" />
            <span>In Active Development</span>
          </span>
        );
    }
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Verified Feature Matrix
          </div>
          <HeadingTag className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Real Skills & True Collaboration
          </HeadingTag>
          <p className="text-base text-slate-300 mt-4 leading-relaxed">
            In accordance with our strict truth-in-engineering standards, every capability below represents verified architectural features designed to connect customers, skilled service providers, and companies across India.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div role="group" aria-label="Filter features by release stage" className="flex flex-wrap items-center gap-2 mb-10 p-1.5 glass-panel rounded-2xl w-fit">
          <button
            type="button"
            aria-pressed={selectedFilter === 'all'}
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            All Features ({servicesList.length})
          </button>
          <button
            type="button"
            aria-pressed={selectedFilter === 'Launch Feature (8 Nov 2026)'}
            onClick={() => setSelectedFilter('Launch Feature (8 Nov 2026)')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'Launch Feature (8 Nov 2026)'
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Launch Features (Nov 8)
          </button>
          <button
            type="button"
            aria-pressed={selectedFilter === 'Core Architecture'}
            onClick={() => setSelectedFilter('Core Architecture')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'Core Architecture'
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Core Architecture
          </button>
          <button
            type="button"
            aria-pressed={selectedFilter === 'In Development (Post-Launch)'}
            onClick={() => setSelectedFilter('In Development (Post-Launch)')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'In Development (Post-Launch)'
                ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            In Development
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feat) => (
            <div
              key={feat.id}
              className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between group"
            >
              <div>
                {/* Status & Category */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  {getStatusBadge(feat.status)}
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    {feat.category}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:border-cyan-400/50 transition-colors">
                    {getIcon(feat.iconName)}
                  </div>
                  <SubHeadingTag className="text-base font-bold text-white tracking-tight leading-snug">
                    {feat.title}
                  </SubHeadingTag>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {feat.summary}
                </p>

                {/* Checklist of Details */}
                <div className="space-y-2 pt-3 border-t border-white/5">
                  {feat.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                      <span className="text-cyan-400 font-bold shrink-0">·</span>
                      <span className="leading-tight">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Engagement Button */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCustomerModal) {
                      onOpenCustomerModal(
                        'Feature Inquiry & Engagement',
                        feat.title,
                        `Customer Request for ${feat.title}: I want to utilize this feature on SkillConnect.`
                      );
                    } else if (onNavigate) {
                      onNavigate('contact');
                    }
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl glass-panel text-cyan-300 hover:text-white hover:border-cyan-400/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isLive ? 'Engage Live Feature' : 'Inquire / Request Access'}</span>
                </button>
              </div>

              {/* Bottom tag */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Domain:</span>
                <span className="text-slate-200 font-medium">SkillConnect Platform</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notice on Authenticity */}
        <div className="mt-12 glass-panel rounded-2xl p-6 border border-cyan-500/20 max-w-3xl">
          <SubHeadingTag className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>Transparency & Verification Guarantee</span>
          </SubHeadingTag>
          <p className="text-xs text-slate-300 leading-relaxed">
            SkillConnect does not fabricate testimonials, fictitious enterprise partner logos, or fake user counts. We believe authentic technology speaks through thoughtful design and dependable execution.
          </p>
        </div>

        {/* Live Google Search Grounded Market Intelligence */}
        <SkillSearchInsights />
      </div>
    </section>
  );
};

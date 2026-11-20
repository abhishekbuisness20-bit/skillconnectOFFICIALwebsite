import React, { useState, useEffect, useRef } from 'react';
import { PageView } from '../types';
import { useCMS } from '../context/CMSContext';
import { getViewPath, handleSpaLinkClick } from '../utils/seoRouting';
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Quote, 
  ShieldCheck, 
  MapPin, 
  MessageSquarePlus, 
  Pause, 
  Play, 
  CheckCircle2, 
  Sparkles,
  Users,
  Award,
  Check
} from 'lucide-react';

interface CommunityFeedbackSectionProps {
  onNavigate?: (view: PageView) => void;
  onOpenFeedbackModal?: () => void;
  onOpenProviderModal?: () => void;
  isStandalonePage?: boolean;
}

export const CommunityFeedbackSection: React.FC<CommunityFeedbackSectionProps> = ({
  onNavigate,
  onOpenFeedbackModal,
  onOpenProviderModal,
  isStandalonePage = false,
}) => {
  const HeadingTag = isStandalonePage ? 'h1' : 'h2';
  const SubHeadingTag = isStandalonePage ? 'h2' : 'h3';
  const { activeConfig } = useCMS();
  const testimonialsList = activeConfig.testimonials;
  const [activeCategory, setActiveCategory] = useState<'all' | 'trades' | 'tech' | 'mentorship'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredTestimonials = activeCategory === 'all'
    ? testimonialsList
    : testimonialsList.filter((t) => t.category === activeCategory);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Autoplay rotation every 5.5 seconds
  useEffect(() => {
    if (isPaused || filteredTestimonials.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, filteredTestimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredTestimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const currentItem = filteredTestimonials[currentIndex] || filteredTestimonials[0];
  if (!currentItem) return null;

  return (
    <section id="community-feedback" className="py-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-semibold text-cyan-400 uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Early Tester Impressions · Pre-Launch Beta</span>
            </div>
            <HeadingTag className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Community Feedback & Credibility
            </HeadingTag>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Real impressions from certified service contractors, full-stack developers, students, and educators across India who are actively evaluating SkillConnect's architecture ahead of our <strong className="text-white">{activeConfig.homepage.launchDateString}</strong> release.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {onOpenFeedbackModal && (
              <button
                onClick={onOpenFeedbackModal}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider text-cyan-300 glass-card hover:border-cyan-400/50 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <MessageSquarePlus className="w-4 h-4 text-cyan-400" />
                <span>Share Your Feedback</span>
              </button>
            )}
            {onOpenProviderModal && (
              <button
                onClick={onOpenProviderModal}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Join Beta Network</span>
              </button>
            )}
          </div>
        </div>

        {/* Credibility Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              4.9 / 5.0
            </span>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" />
              <span>Average Beta Rating</span>
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              6+ Cities
            </span>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 inline" />
              <span>Active Pre-Testing Across India</span>
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              0% Middleman
            </span>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 inline" />
              <span>Zero Commission Extraction</span>
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              100% Verified
            </span>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400 inline" />
              <span>Founder & Governance Backing</span>
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div role="group" aria-label="Filter community feedback by category" className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-slate-300 mr-2 font-mono uppercase">Filter by Domain:</span>
          {[
            { id: 'all', label: 'All Community Feedback', count: testimonialsList.length },
            { id: 'trades', label: 'Skilled Trades & Services', count: testimonialsList.filter(t => t.category === 'trades').length },
            { id: 'tech', label: 'Developers & Tech Talent', count: testimonialsList.filter(t => t.category === 'tech').length },
            { id: 'mentorship', label: 'Mentors & Educators', count: testimonialsList.filter(t => t.category === 'mentorship').length },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              aria-pressed={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'glass-card text-slate-300 hover:text-white hover:border-white/20'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeCategory === cat.id ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/5 text-slate-300'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Featured Testimonial Carousel Spotlight */}
        <div 
          className="relative glass-card rounded-3xl p-6 sm:p-10 border border-cyan-500/20 shadow-2xl transition-all duration-300 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Top Decorative Elements */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(currentItem.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">5.0 / 5.0</span>
              <span className="text-slate-400 hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-xs text-slate-300 hidden sm:inline">Tested {currentItem.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                <span>{currentItem.badge}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full hidden md:inline">
                {currentItem.featureTested}
              </span>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="relative mb-8 pl-0 sm:pl-4">
            <Quote className="w-10 h-10 text-cyan-500/20 absolute -top-4 -left-2 sm:-left-6 -z-10" aria-hidden="true" />
            <blockquote className="text-base sm:text-xl text-slate-100 font-normal leading-relaxed italic">
              "{currentItem.quote}"
            </blockquote>
          </div>

          {/* Reviewer Meta & Controls Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white/10">
            {/* Reviewer Details */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentItem.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                {currentItem.avatarInitials}
              </div>
              <div>
                <SubHeadingTag className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>{currentItem.name}</span>
                  <span 
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40" 
                    title="Verified Early Tester"
                    aria-hidden="true"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="text-[10px] font-medium text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono hidden sm:inline">
                    Verified
                  </span>
                </SubHeadingTag>
                <p className="text-xs text-slate-300">
                  {currentItem.role}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-cyan-400 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{currentItem.city}, {currentItem.state} · India</span>
                </div>
              </div>
            </div>

            {/* Carousel Interactive Controls */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              {/* Autoplay Pause/Play button */}
              <button
                type="button"
                aria-pressed={isPaused}
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-xl glass-panel text-slate-300 hover:text-white transition-colors cursor-pointer text-xs min-w-[36px] min-h-[36px] flex items-center justify-center"
                title={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
                aria-label={isPaused ? 'Resume testimonial auto-rotation' : 'Pause testimonial auto-rotation'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" /> : <Pause className="w-3.5 h-3.5" aria-hidden="true" />}
              </button>

              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Indicator dots */}
              <div className="flex items-center gap-1 px-1" role="group" aria-label="Testimonial slides">
                {filteredTestimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-pressed={currentIndex === idx}
                    onClick={() => setCurrentIndex(idx)}
                    className="p-1.5 flex items-center justify-center cursor-pointer"
                    aria-label={`View testimonial ${idx + 1} of ${filteredTestimonials.length}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 rounded-full transition-all block ${
                        currentIndex === idx
                          ? 'w-6 bg-gradient-to-r from-cyan-400 to-purple-500'
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Preview Grid for quick browsing (Keyboard accessible button cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {filteredTestimonials.slice(0, 3).map((item, idx) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={currentIndex === idx}
              onClick={() => setCurrentIndex(idx)}
              className={`text-left w-full p-5 rounded-2xl glass-card transition-all cursor-pointer border ${
                currentIndex === idx
                  ? 'border-cyan-400/50 shadow-[0_0_25px_rgba(0,242,254,0.15)] bg-slate-900/90'
                  : 'border-white/5 hover:border-white/20 bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  {item.featureTested}
                </span>
                <div className="flex items-center gap-0.5 text-amber-400" aria-label={`Rated ${item.rating} out of 5`}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4 italic">
                "{item.quote}"
              </p>

              <div className="flex items-center gap-2.5 pt-3 border-t border-white/5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`} aria-hidden="true">
                  {item.avatarInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    <span className="truncate">{item.name}</span>
                    <span 
                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shrink-0" 
                      title="Verified Early Tester"
                      aria-hidden="true"
                    >
                      <Check className="w-2 h-2 stroke-[3]" />
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">{item.city}, {item.state}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Accountability & Verification Guarantee footer */}
        <div className="mt-12 p-5 rounded-2xl glass-panel border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Zero Fabricated Endorsements Policy</strong>
              <span className="text-slate-400">
                All testimonials represent real feedback from invited early access testing across Indian states ahead of the November 8, 2026 launch. Inquiries can be directly cross-checked with founder Abhishek Singh.
              </span>
            </div>
          </div>
          {onNavigate && (
            <a
              href={getViewPath('contact')}
              onClick={(e) => handleSpaLinkClick(e, 'contact', onNavigate)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold whitespace-nowrap cursor-pointer underline text-xs inline-flex items-center min-h-[44px]"
            >
              Contact Leadership →
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

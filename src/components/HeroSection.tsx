import React, { useState, useEffect, Suspense, lazy } from 'react';
import { PageView } from '../types';
import { BRAND_CONFIG } from '../data/websiteContent';
import { useCMS } from '../context/CMSContext';
import { getViewPath, handleSpaLinkClick } from '../utils/seoRouting';
import { ArrowRight, Smartphone, Sparkles, User, Calendar, ShieldCheck } from 'lucide-react';

const Hero3DScene = lazy(() =>
  import('./Hero3DScene').then((m) => ({
    default: m.Hero3DScene,
  }))
);

const HeroStaticLogoPlaceholder: React.FC = () => (
  <div className="space-y-4">
    <div className="w-full h-[300px] sm:h-[340px] rounded-2xl bg-gradient-to-b from-[#FFFFFF] via-[#F2F8FF] to-[#E6F4FE] border border-[#08C8F0]/35 flex flex-col items-center justify-center relative overflow-hidden p-6 shadow-[inset_0_0_40px_rgba(8,200,240,0.14)]">
      <div className="relative p-3 rounded-full bg-[#041024] border-2 border-[#08C8F0]/70 shadow-[0_14px_40px_rgba(8,200,240,0.28)]">
        <img
          src={BRAND_CONFIG.logoPath}
          alt="SkillConnect Official Logo - Two connected figures in cyan and green above the SkillConnect wordmark"
          className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-full"
          width="176"
          height="176"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
    <div className="px-1 text-center sm:text-left">
      <div className="text-base sm:text-lg font-extrabold tracking-widest text-white">
        SKILLCONNECT
      </div>
      <p className="text-xs sm:text-sm font-medium text-[#08C8F0]">
        Connecting Skills. Creating Opportunities.
      </p>
    </div>
  </div>
);

interface HeroSectionProps {
  onNavigate: (view: PageView) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { activeConfig } = useCMS();
  // Live countdown to 8 November 2026
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = BRAND_CONFIG.launchTimestamp - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Ambient background glow orbs using Official Navy / Electric Cyan / SkillConnect Green */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[360px] bg-gradient-to-tr from-[#08C8F0]/15 via-[#27D879]/10 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#08C8F0]/12 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-[#27D879]/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Tagline kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#08C8F0] mb-4">
              <Sparkles className="w-4 h-4 text-[#27D879] shrink-0" aria-hidden="true" />
              <span>{activeConfig.homepage.tagline}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6 [text-wrap:balance]">
              {activeConfig.homepage.mainHeadingLine1} <br />
              <span className="bg-gradient-to-r from-[#08C8F0] via-[#EAF5FF] to-[#27D879] bg-clip-text text-transparent">
                {activeConfig.homepage.mainHeadingHighlight}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-8 max-w-2xl">
              {activeConfig.homepage.description}
            </p>

            {/* Trust and Attribution Metadata strip */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 mb-8 border-y border-white/5 py-3 w-full">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <User className="w-3.5 h-3.5 text-[#08C8F0]" aria-hidden="true" />
                <span>Founder & Developer: <strong className="text-white">{BRAND_CONFIG.founder}</strong></span>
              </div>
              <span className="hidden sm:inline text-slate-600" aria-hidden="true">·</span>
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#27D879]" aria-hidden="true" />
                <span>Administration: <strong className="text-slate-200">Abhay Singh · Adarsh Singh · Abhay Bharti</strong></span>
              </div>
              <span className="hidden sm:inline text-slate-600" aria-hidden="true">·</span>
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#08C8F0]" aria-hidden="true" />
                <span>Official Launch: <strong className="text-cyan-300">{activeConfig.homepage.launchDateString}</strong></span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <a
                href={getViewPath('showcase')}
                onClick={(e) => handleSpaLinkClick(e, 'showcase', onNavigate)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-[#071426] bg-gradient-to-r from-[#08C8F0] to-[#27D879] hover:brightness-110 shadow-[0_0_25px_rgba(8,200,240,0.35)] hover:shadow-[0_0_35px_rgba(39,216,121,0.45)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" aria-hidden="true" />
                <span>Explore App Showcase</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href={getViewPath('features')}
                onClick={(e) => handleSpaLinkClick(e, 'features', onNavigate)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 glass-card hover:text-white hover:border-[#08C8F0]/50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Verified Features</span>
              </a>

              <a
                href={getViewPath('contact')}
                onClick={(e) => handleSpaLinkClick(e, 'contact', onNavigate)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-medium text-sm text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-center sm:text-left"
              >
                Contact Founder →
              </a>
            </div>
          </div>

          {/* Right Column: Interactive 3D SkillConnect Brand Medallion & Live Launch Status */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-lg glass-card rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-2xl border border-[#08C8F0]/25 space-y-5">
              {/* Subtle top inner gradient highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#08C8F0]/60 to-transparent" />

              {/* Lightweight 3D Floating Brand Scene with Instant Static Logo Fallback */}
              <Suspense fallback={<HeroStaticLogoPlaceholder />}>
                <Hero3DScene />
              </Suspense>

              {/* Conditional: Live on Play Store or Countdown Box */}
              {Date.now() >= BRAND_CONFIG.launchTimestamp ? (
                <div className="bg-[#071426]/90 rounded-2xl p-4 sm:p-5 border border-[#27D879]/40 shadow-[0_0_30px_rgba(39,216,121,0.18)]">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#27D879] uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27D879] animate-pulse" />
                    <span>App is Live on Playstore</span>
                  </div>
                  <h2 className="text-base font-bold text-white mb-1.5">
                    SkillConnect is Live on Google Play Store
                  </h2>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    The official SkillConnect app is now live on Google Play. All platform features are active on the website and app.
                  </p>

                  <a
                    href={activeConfig.contact.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-[#071426] bg-gradient-to-r from-[#27D879] to-[#08C8F0] hover:brightness-110 shadow-[0_0_20px_rgba(39,216,121,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" aria-hidden="true" />
                    <span>Get it on Google Play</span>
                  </a>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Platform Status:</span>
                    <span className="text-[#27D879] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> All Features Active
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#071426]/85 rounded-2xl p-4 border border-[#08C8F0]/25">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-cyan-300 font-semibold uppercase tracking-wider">
                      Official Launch Countdown
                    </span>
                    <span className="text-amber-300 font-semibold">{activeConfig.homepage.launchDateString}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="bg-slate-900/90 rounded-xl p-2.5 border border-white/5">
                      <span className="block text-2xl font-bold text-white tabular-nums">
                        {timeLeft.days}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                        Days
                      </span>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-2.5 border border-white/5">
                      <span className="block text-2xl font-bold text-white tabular-nums">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                        Hours
                      </span>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-2.5 border border-white/5">
                      <span className="block text-2xl font-bold text-white tabular-nums">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                        Mins
                      </span>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-2.5 border border-white/5">
                      <span className="block text-2xl font-bold text-[#08C8F0] tabular-nums">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                        Secs
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Targeted Release Status:</span>
                    <span className="text-[#08C8F0] font-semibold">Active Development</span>
                  </div>
                </div>
              )}

              {/* Direct CTA link */}
              <a
                href={getViewPath('launch')}
                onClick={(e) => handleSpaLinkClick(e, 'launch', onNavigate)}
                className="block w-full py-2 text-xs text-center text-slate-300 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[#08C8F0]/25 rounded-xl"
              >
                Read Launch & Architecture Briefing →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

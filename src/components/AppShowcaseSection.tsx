import React, { useState } from 'react';
import { PageView } from '../types';
import { BRAND_CONFIG } from '../data/websiteContent';
import { 
  Smartphone, 
  Calendar, 
  Layers, 
  Search, 
  Award, 
  MessageSquare, 
  Briefcase, 
  Check, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';

interface AppShowcaseSectionProps {
  onNavigate?: (view: PageView) => void;
  onOpenCustomerModal?: (actionType: string, targetFeature?: string, defaultDetails?: string) => void;
  isStandalonePage?: boolean;
}

type ScreenType = 'feed' | 'profile' | 'chat' | 'opportunities';

export const AppShowcaseSection: React.FC<AppShowcaseSectionProps> = ({
  onNavigate,
  onOpenCustomerModal,
  isStandalonePage = false,
}) => {
  const HeadingTag = isStandalonePage ? 'h1' : 'h2';
  const SubHeadingTag = isStandalonePage ? 'h2' : 'h3';
  const [activeScreen, setActiveScreen] = useState<ScreenType>('feed');
  const isLive = Date.now() >= BRAND_CONFIG.launchTimestamp;

  const screens = [
    {
      id: 'feed' as ScreenType,
      title: 'Skill Matchmaking Feed',
      description: 'Discover peers offering complementary skills nearby and globally.',
      icon: Search,
    },
    {
      id: 'profile' as ScreenType,
      title: 'Verified Skill Profile',
      description: 'Cryptographically backed project proof and verified peer badges.',
      icon: Award,
    },
    {
      id: 'chat' as ScreenType,
      title: 'Direct Mentorship Chat',
      description: 'Focused 1-on-1 exchange sessions with structured code context.',
      icon: MessageSquare,
    },
    {
      id: 'opportunities' as ScreenType,
      title: 'Opportunity & Gig Board',
      description: 'Curated projects, student apprenticeships, and freelance gigs.',
      icon: Briefcase,
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Mobile Interface Preview
          </div>
          <HeadingTag className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SkillConnect Mobile Experience
          </HeadingTag>
          <p className="text-base text-slate-300 mt-4 leading-relaxed">
            Engineered for fluid touch interactions, instant matchmaking between customers and skilled service providers, and distraction-free collaboration across India.
          </p>
          
          {/* Conditional Banner: Live on Play Store or Coming Soon */}
          {isLive ? (
            <div className="mt-6 inline-flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl glass-panel border border-emerald-500/40 text-xs text-emerald-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span className="font-bold text-white">App is Live on Google Play Store</span>
              <span className="text-slate-400" aria-hidden="true">|</span>
              <a
                href={BRAND_CONFIG.playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white font-semibold flex items-center gap-1 text-cyan-300 cursor-pointer"
              >
                <span>Download from Play Store</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          ) : (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl glass-panel border border-cyan-500/30 text-xs text-cyan-300 font-medium">
              <Calendar className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>Coming Soon – 8 November 2026</span>
              <span className="text-slate-400" aria-hidden="true">|</span>
              <span className="text-slate-300">Android & Web Client Release</span>
            </div>
          )}
        </div>

        {/* Showcase Grid: Interactive Controls & Phone Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Screen Switcher & Feature Descriptions */}
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select an interface screen to inspect:
            </p>
            {screens.map((screen) => {
              const Icon = screen.icon;
              const isActive = activeScreen === screen.id;
              return (
                <button
                  key={screen.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveScreen(screen.id)}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'glass-card border-cyan-400/50 shadow-[0_0_25px_rgba(0,242,254,0.15)] bg-slate-900/80'
                      : 'glass-panel border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-800 text-slate-300 group-hover:text-cyan-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <SubHeadingTag
                        className={`text-base font-bold transition-colors ${
                          isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                        }`}
                      >
                        {screen.title}
                      </SubHeadingTag>
                      <p className="text-xs text-slate-300 mt-1">
                        {screen.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    aria-hidden="true"
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'text-cyan-400 translate-x-1' : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}

            {/* Google Play / APK Safety Notice */}
            <div className="mt-8 p-4 rounded-xl glass-panel border border-purple-500/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Safety Advisory:</strong> SkillConnect will only be distributed through official verified channels (Google Play Store and our verified web portal) on <strong>8 November 2026</strong>. Avoid downloading unauthorized third-party APK files claiming to be SkillConnect.
              </div>
            </div>
          </div>

          {/* Right: High-Fidelity Smartphone Device Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-[310px] sm:w-[330px] rounded-[48px] p-3.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-[0_25px_60px_-15px_rgba(0,242,254,0.25)] border-[3px] border-slate-700/80">
              {/* Outer button physical bezels */}
              <div className="absolute -left-[5px] top-28 w-1 h-12 bg-slate-700 rounded-l-md" />
              <div className="absolute -left-[5px] top-44 w-1 h-12 bg-slate-700 rounded-l-md" />
              <div className="absolute -right-[5px] top-36 w-1 h-16 bg-slate-700 rounded-r-md" />

              {/* Inner Screen Chassis */}
              <div className="relative w-full h-[620px] bg-[#070b1e] rounded-[38px] overflow-hidden border border-slate-800 flex flex-col justify-between select-none">
                {/* Dynamic Island / Camera Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                </div>

                {/* Mobile Status Bar */}
                <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] text-slate-400 z-20 font-mono">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <div className="w-5 h-2.5 rounded-sm border border-slate-500 p-0.5 flex items-center">
                      <div className="w-full h-full bg-cyan-400 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Mobile App Header with Original Logo */}
                <div className="px-5 py-2.5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={BRAND_CONFIG.logoPath}
                      alt="SkillConnect Mobile App Logo - Verified Professionals"
                      className="w-7 h-7 rounded-lg object-cover border border-cyan-400/40"
                      width="28"
                      height="28"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-sm font-bold text-white tracking-tight">
                      Skill<span className="text-cyan-400">Connect</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-semibold border border-cyan-500/20">
                    Preview
                  </span>
                </div>

                {/* Screen Content Renderings */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {activeScreen === 'feed' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="bg-slate-900/90 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center">
                            RK
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1">
                              Rohan K. <Check className="w-3 h-3 text-cyan-400" />
                            </div>
                            <div className="text-[10px] text-slate-400">Full Stack Engineer</div>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 mb-2">
                          Offers: <strong className="text-cyan-300">React & Next.js</strong> · Seeks: <strong className="text-purple-300">Rust System Programming</strong>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onOpenCustomerModal?.('Peer Skill Barter Request', 'Rohan K. (React & Next.js)', 'Customer request to trade skills with Rohan K. (Full Stack Engineer): React & Next.js barter.')}
                            className="flex-1 py-1.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                          >
                            Exchange Skill
                          </button>
                          <button
                            onClick={() => onOpenCustomerModal?.('Profile Inquiry', 'Rohan K. Profile', 'Customer requested verified credential profile for Rohan K.')}
                            className="px-2.5 py-1.5 text-[10px] bg-white/5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                          >
                            Profile
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                            AP
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1">
                              Ananya P. <Check className="w-3 h-3 text-cyan-400" />
                            </div>
                            <div className="text-[10px] text-slate-400">UI/UX Designer</div>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 mb-2">
                          Offers: <strong className="text-cyan-300">Design Systems</strong> · Seeks: <strong className="text-purple-300">TypeScript Basics</strong>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onOpenCustomerModal?.('Peer Skill Barter Request', 'Ananya P. (Design Systems)', 'Customer request to trade skills with Ananya P. (UI/UX Designer): Design Systems barter.')}
                            className="flex-1 py-1.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                          >
                            Exchange Skill
                          </button>
                          <button
                            onClick={() => onOpenCustomerModal?.('Profile Inquiry', 'Ananya P. Profile', 'Customer requested verified credential profile for Ananya P.')}
                            className="px-2.5 py-1.5 text-[10px] bg-white/5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeScreen === 'profile' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="text-center p-3 bg-slate-900/80 rounded-xl border border-white/5">
                        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 p-0.5 mb-2">
                          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-bold text-white text-base">
                            AS
                          </div>
                        </div>
                        <div className="text-xs font-bold text-white">Abhishek Singh</div>
                        <div className="text-[10px] text-cyan-400 font-medium">Platform Architect · SkillConnect</div>
                        <div className="mt-2 text-[10px] text-slate-300 max-w-xs mx-auto">
                          Building peer-to-peer talent infrastructure with verifiable project proof across India.
                        </div>
                        <button
                          onClick={() => onOpenCustomerModal?.('Mentorship Request', 'Abhishek Singh Profile', 'Customer requested 1-on-1 mentorship consultation with Founder Abhishek Singh.')}
                          className="mt-3 w-full py-1.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 cursor-pointer"
                        >
                          Request Mentorship with Abhishek
                        </button>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-wider">
                          Verified Skill Badges
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                            Full-Stack React
                          </span>
                          <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                            System Architecture
                          </span>
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                            API Security
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeScreen === 'chat' && (
                    <div className="space-y-2.5 text-xs animate-in fade-in duration-200">
                      <div className="text-center text-[10px] text-slate-400 my-1 font-mono">
                        Session: Architecture Code Review
                      </div>
                      <div className="bg-slate-800/80 rounded-xl rounded-tl-sm p-2.5 max-w-[85%] text-slate-200 border border-white/5">
                        <div className="text-[9px] text-cyan-400 font-bold mb-0.5">Mentor Abhishek</div>
                        I reviewed your schema draft! Let's ensure strict relational boundaries for verified badges.
                      </div>
                      <div className="bg-cyan-600/30 border border-cyan-500/40 rounded-xl rounded-tr-sm p-2.5 max-w-[85%] ml-auto text-cyan-100">
                        Thanks Abhishek! I just pushed the updated interfaces to the test repository.
                      </div>
                      <div className="bg-slate-800/80 rounded-xl rounded-tl-sm p-2.5 max-w-[85%] text-slate-200 border border-white/5">
                        <div className="text-[9px] text-cyan-400 font-bold mb-0.5">Mentor Abhishek</div>
                        Excellent. Ready for our live audio walkthrough at 14:00 UTC.
                      </div>
                      <button
                        onClick={() => onOpenCustomerModal?.('Live Mentorship Booking', 'Mentorship Channel', 'Customer requested to schedule or join an active mentorship channel with Mentor Abhishek.')}
                        className="w-full mt-2 py-1.5 text-[10px] font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg cursor-pointer"
                      >
                        Book Live Session
                      </button>
                    </div>
                  )}

                  {activeScreen === 'opportunities' && (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      <div className="bg-slate-900/90 rounded-xl p-3 border border-white/5">
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs font-bold text-white">Open Source Web App</div>
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded font-mono">Apprentice Track</span>
                        </div>
                        <div className="text-[10px] text-slate-300 mb-2">
                          Collaborate on a decentralized credential viewer with senior guidance.
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 pt-2 border-t border-white/5">
                          <span>3 Weeks · Remote</span>
                          <button
                            onClick={() => onOpenCustomerModal?.('Apprentice Role Application', 'Open Source Web App', 'Customer applied for the Open Source Web App Apprentice Track.')}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded font-semibold hover:bg-emerald-500/30 cursor-pointer"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-3 border border-white/5">
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs font-bold text-white">Design System Auditor</div>
                          <span className="text-[9px] text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded font-mono">Peer Barter</span>
                        </div>
                        <div className="text-[10px] text-slate-300 mb-2">
                          Audit accessibility & glassmorphism tokens for an upcoming student project.
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 pt-2 border-t border-white/5">
                          <span>Skill Credit: 8 Hours</span>
                          <button
                            onClick={() => onOpenCustomerModal?.('Peer Barter Application', 'Design System Auditor', 'Customer applied for the Design System Auditor Peer Barter.')}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded font-semibold hover:bg-purple-500/30 cursor-pointer"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Bottom Navigation Bar */}
                <div className="px-6 py-2.5 border-t border-white/10 bg-[#050814]/90 flex items-center justify-between text-slate-400">
                  <div className="flex flex-col items-center">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span className="text-[8px] mt-0.5 text-cyan-400">Feed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Award className="w-4 h-4" />
                    <span className="text-[8px] mt-0.5">Badges</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[8px] mt-0.5">Chat</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-[8px] mt-0.5">Gigs</span>
                  </div>
                </div>

                {/* Bottom Home Indicator Bar */}
                <div className="pb-1.5 pt-1 flex justify-center bg-[#050814]/90">
                  <div className="w-24 h-1 bg-slate-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { PageView } from '../types';
import { BRAND_CONFIG } from '../data/websiteContent';
import { getViewPath, handleSpaLinkClick } from '../utils/seoRouting';
import {
  Menu,
  X,
  Rocket,
  Sparkles,
  UserPlus,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const THEME_STORAGE_KEY = 'skillconnect-theme';

interface NavbarProps {
  currentView: PageView;
  onNavigate: (view: PageView, explicitPath?: string) => void;
  onOpenProviderModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenProviderModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage write errors in restricted browsing modes
    }
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#050814');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll and support Escape key when mobile slide-in drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks: { label: string; view: PageView; href?: string }[] = [
    { label: 'Home', view: 'home' },
    { label: 'About Us', view: 'about' },
    { label: 'Features', view: 'features' },
    { label: 'App Showcase', view: 'showcase' },
    { label: 'Feedback', view: 'feedback' },
    { label: 'Launch Info', view: 'launch' },
    { label: 'Contact Us', view: 'contact' },
  ];

  const legalDrawerLinks: { label: string; view: PageView }[] = [
    { label: 'Privacy Policy', view: 'privacy' },
    { label: 'Terms & Conditions', view: 'terms' },
    { label: 'Platform Disclaimer', view: 'disclaimer' },
    { label: 'Account Deletion', view: 'deletion' },
  ];

  const handleNavClick = (view: PageView, explicitPath?: string) => {
    onNavigate(view, explicitPath);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 sm:gap-8">
            {/* Zone 1: Brand Zone with Original Uploaded Logo */}
            <a
              href={getViewPath('home')}
              onClick={(e) => handleSpaLinkClick(e, 'home', handleNavClick)}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1 min-h-[44px]"
              aria-label="SkillConnect Home"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.3)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,242,254,0.5)] transition-all shrink-0">
                <img
                  src={BRAND_CONFIG.logoPath}
                  alt="SkillConnect Official Logo - Find Trusted Professionals & Services Across India"
                  className="w-full h-full object-cover"
                  width="40"
                  height="40"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                  Skill<span className="text-cyan-400">Connect</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium whitespace-nowrap hidden sm:block">
                  Official Web Portal
                </span>
              </div>
            </a>

            {/* Zone 2: Desktop Navigation Links */}
            <nav
              aria-label="Primary Navigation"
              className="hidden md:flex items-center gap-7 text-sm font-medium"
            >
              {navLinks.map((link) => {
                const isActive = currentView === link.view;
                return (
                  <a
                    key={link.view}
                    href={getViewPath(link.view)}
                    onClick={(e) => handleSpaLinkClick(e, link.view, handleNavClick)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`transition-all duration-200 cursor-pointer whitespace-nowrap py-1 relative ${
                      isActive
                        ? 'text-cyan-400 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Zone 3: Primary Action, Theme Toggle & Mobile Slide-In Drawer Trigger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Global Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl glass-card hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-cyan-600" />
                )}
              </button>

              {onOpenProviderModal && (
                <button
                  type="button"
                  onClick={onOpenProviderModal}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold uppercase tracking-wider text-cyan-300 glass-card hover:border-cyan-400/50 hover:text-white rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                  <span>Join as Provider</span>
                </button>
              )}

              {Date.now() >= BRAND_CONFIG.launchTimestamp ? (
                <a
                  href={BRAND_CONFIG.playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl hover:from-emerald-400 hover:to-cyan-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>App Live on Play Store</span>
                </a>
              ) : (
                <a
                  href={getViewPath('launch')}
                  onClick={(e) => handleSpaLinkClick(e, 'launch', handleNavClick)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl hover:from-cyan-400 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.5)] cursor-pointer whitespace-nowrap"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Launch: 8 Nov 2026</span>
                </a>
              )}

              {/* Mobile Slide-In Drawer Hamburger Toggle (44x44px minimum touch target) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-slide-drawer"
                aria-label={mobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
                className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-slate-200 hover:text-white glass-card hover:border-cyan-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer flex items-center justify-center transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-In Navigation Drawer & Backdrop Scrim */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto visible'
            : 'opacity-0 pointer-events-none invisible'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop Overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Slide-In Right Drawer Panel */}
        <aside
          id="mobile-slide-drawer"
          aria-label="Mobile Navigation Drawer"
          className={`absolute top-0 right-0 bottom-0 w-[86vw] max-w-sm bg-[#070c1f]/95 border-l border-cyan-500/25 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <a
                href={getViewPath('home')}
                onClick={(e) => handleSpaLinkClick(e, 'home', handleNavClick)}
                className="flex items-center gap-3 min-h-[44px]"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40 shrink-0">
                  <img
                    src={BRAND_CONFIG.logoPath}
                    alt="SkillConnect Official Logo"
                    className="w-full h-full object-cover"
                    width="36"
                    height="36"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="text-base font-bold text-white tracking-tight block leading-none">
                    Skill<span className="text-cyan-400">Connect</span>
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5 block">
                    Official Web Portal
                  </span>
                </div>
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="min-w-[44px] min-h-[44px] rounded-xl glass-card text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5 text-cyan-400" />
              </button>
            </div>

            {/* Primary Public Routes List */}
            <nav aria-label="Mobile Public Routes" className="px-4 py-4 space-y-1.5">
              <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Platform Navigation
              </div>
              {navLinks.map((link) => {
                const isActive = currentView === link.view;
                return (
                  <a
                    key={link.view}
                    href={getViewPath(link.view)}
                    onClick={(e) => handleSpaLinkClick(e, link.view, handleNavClick)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`min-h-[48px] px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                        : 'text-slate-200 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive ? (
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    )}
                  </a>
                );
              })}

              {/* Direct Services Canonical Route Alias for Search & Touch Accessibility */}
              <a
                href="/services"
                onClick={(e) => handleSpaLinkClick(e, 'features', handleNavClick, '/services')}
                className="min-h-[48px] px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Services Marketplace</span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              </a>
            </nav>

            {/* Legal & Compliance Public Routes */}
            <nav
              aria-label="Mobile Legal and Compliance Routes"
              className="px-4 pt-2 pb-4 border-t border-white/10"
            >
              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Compliance &amp; Legal Routes
              </div>
              <div className="grid grid-cols-2 gap-2">
                {legalDrawerLinks.map((item) => {
                  const isActive = currentView === item.view;
                  return (
                    <a
                      key={item.view}
                      href={getViewPath(item.view)}
                      onClick={(e) => handleSpaLinkClick(e, item.view, handleNavClick)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between border transition-colors ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-white/[0.03] text-slate-300 border-white/5 hover:border-cyan-500/30 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Sticky Bottom Thumb-Zone Action Bar */}
          <div className="p-4 border-t border-white/10 bg-slate-950/80 space-y-2.5">
            {onOpenProviderModal && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProviderModal();
                }}
                className="w-full min-h-[48px] py-3 px-4 text-xs font-semibold uppercase tracking-wider text-center text-cyan-300 glass-card hover:border-cyan-400 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Join as Service Provider</span>
              </button>
            )}

            <a
              href={getViewPath('launch')}
              onClick={(e) => handleSpaLinkClick(e, 'launch', handleNavClick)}
              className="w-full min-h-[48px] py-3 px-4 text-xs font-semibold uppercase tracking-wider text-center text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4 shrink-0" />
              <span>Launch Milestone (8 Nov 2026)</span>
            </a>

            <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Founded by Abhishek Singh · India</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

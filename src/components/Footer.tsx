import React from 'react';
import { PageView } from '../types';
import { BRAND_CONFIG } from '../data/websiteContent';
import { useCMS } from '../context/CMSContext';
import { getViewPath, handleSpaLinkClick } from '../utils/seoRouting';
import { Terminal, Instagram, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: PageView, explicitPath?: string) => void;
  onOpenExportGuide: () => void;
  onOpenFounderLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenExportGuide,
  onOpenFounderLogin,
}) => {
  const { activeConfig, isFounderAuthorized } = useCMS();

  return (
    <footer className="border-t border-white/10 bg-[#030611] pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          {/* Col 1: Brand, Original Logo, & Tagline */}
          <div className="lg:col-span-5 space-y-4">
            <a
              href={getViewPath('home')}
              onClick={(e) => handleSpaLinkClick(e, 'home', onNavigate)}
              className="inline-flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                <img
                  src={BRAND_CONFIG.logoPath}
                  alt="SkillConnect Logo - Connecting Customers and Skilled Service Providers Across India"
                  className="w-full h-full object-cover"
                  width="40"
                  height="40"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Skill<span className="text-cyan-400">Connect</span>
              </span>
            </a>

            <p className="text-xs text-cyan-300 font-semibold tracking-wide uppercase">
              {activeConfig.homepage.tagline}
            </p>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {activeConfig.homepage.description} Conceived and engineered by Founder Abhishek Singh.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
                <span>
                  Target Launch:{' '}
                  <strong className="text-white">{activeConfig.homepage.launchDateString}</strong>
                </span>
              </div>
              <span className="hidden sm:inline text-slate-600">|</span>
              <a
                href={activeConfig.contact.platformInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors"
                title="Follow SkillConnect Official on Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@skillconnectofficiall</span>
              </a>
            </div>

            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Team & Administration Socials
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href={activeConfig.contact.founderInstagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-pink-500/10 border border-white/5 hover:border-pink-500/30 text-slate-300 hover:text-pink-300 transition-all text-[11px]"
                  title="Abhishek Singh (Founder & Developer) on Instagram"
                >
                  <Instagram className="w-3 h-3 text-pink-400" />
                  <span>Abhishek (Founder)</span>
                </a>
                {BRAND_CONFIG.administrationMembers.map((member) => (
                  <a
                    key={member.name}
                    href={member.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-pink-500/10 border border-white/5 hover:border-pink-500/30 text-slate-300 hover:text-pink-300 transition-all text-[11px]"
                    title={`${member.name} (Administration Member) on Instagram`}
                  >
                    <Instagram className="w-3 h-3 text-pink-400" />
                    <span>{member.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform Navigation
            </h2>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href={getViewPath('home')}
                  onClick={(e) => handleSpaLinkClick(e, 'home', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href={getViewPath('about')}
                  onClick={(e) => handleSpaLinkClick(e, 'about', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  About Abhishek Singh & Vision
                </a>
              </li>
              <li>
                <a
                  href={getViewPath('features')}
                  onClick={(e) => handleSpaLinkClick(e, 'features', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Verified Features & Services
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  onClick={(e) => handleSpaLinkClick(e, 'features', onNavigate, '/services')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Services Marketplace
                </a>
              </li>
              <li>
                <a
                  href={getViewPath('showcase')}
                  onClick={(e) => handleSpaLinkClick(e, 'showcase', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Mobile App Showcase
                </a>
              </li>
              <li>
                <a
                  href={getViewPath('launch')}
                  onClick={(e) => handleSpaLinkClick(e, 'launch', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Launch Information (8 Nov 2026)
                </a>
              </li>
              <li>
                <a
                  href={getViewPath('feedback')}
                  onClick={(e) => handleSpaLinkClick(e, 'feedback', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Community Feedback & Reviews
                </a>
              </li>
              <li>
                <a
                  href={getViewPath('contact')}
                  onClick={(e) => handleSpaLinkClick(e, 'contact', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Contact & Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Compliance & Legal
            </h2>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href={getViewPath('privacy')}
                  onClick={(e) => handleSpaLinkClick(e, 'privacy', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Privacy Policy (GDPR / DPDP)
                </a>
              </li>
              <li>
                <a
                  href={getViewPath('terms')}
                  onClick={(e) => handleSpaLinkClick(e, 'terms', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href={getViewPath('disclaimer')}
                  onClick={(e) => handleSpaLinkClick(e, 'disclaimer', onNavigate)}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Platform Disclaimer
                </a>
              </li>
              <li>
                <a
                  href={getViewPath('deletion')}
                  onClick={(e) => handleSpaLinkClick(e, 'deletion', onNavigate)}
                  className="hover:text-rose-400 transition-colors cursor-pointer text-slate-300 font-medium"
                >
                  Account & Data Deletion Protocol
                </a>
              </li>
            </ul>

            <div className="pt-4">
              <button
                onClick={onOpenExportGuide}
                className="w-full sm:w-auto px-3.5 py-2 text-[11px] font-semibold text-slate-300 hover:text-white glass-panel rounded-xl hover:border-cyan-500/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>GitHub Pages Export & Hosting Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 SkillConnect Official. Independent Indian Skill Platform. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-2 gap-y-1 text-slate-300">
            <span>
              Founded & Developed by{' '}
              <a
                href={activeConfig.contact.founderInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-200 hover:text-cyan-300 font-medium transition-colors"
                title="Founder & Developer Abhishek Singh"
              >
                {BRAND_CONFIG.founder}
              </a>
            </span>
            <span className="hidden sm:inline text-slate-500" aria-hidden="true">|</span>
            <span>
              Administration: <strong className="text-slate-200">Abhay Singh · Adarsh Singh · Abhay Bharti</strong>
            </span>
            <span className="hidden sm:inline text-slate-500" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => {
                if (isFounderAuthorized) {
                  onNavigate('founder-cms');
                } else if (onOpenFounderLogin) {
                  onOpenFounderLogin();
                } else {
                  onNavigate('founder-cms');
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400/50 text-[11px] text-cyan-300 hover:text-white shadow-[0_0_12px_rgba(0,242,254,0.12)] hover:shadow-[0_0_18px_rgba(0,242,254,0.28)] transition-all cursor-pointer font-semibold"
              title="Founder Login & Website Control Panel"
            >
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>{isFounderAuthorized ? 'Founder CMS' : 'Founder'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

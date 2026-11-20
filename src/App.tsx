import React, { useState, useEffect, Suspense, lazy } from 'react';
import { PageView } from './types';
import { useCMS } from './context/CMSContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { FeaturesSection } from './components/FeaturesSection';
import { AppShowcaseSection } from './components/AppShowcaseSection';
import { LaunchInfoSection } from './components/LaunchInfoSection';
import { ContactSection } from './components/ContactSection';
import { AccountDeletionSection } from './components/AccountDeletionSection';
import { LegalSection } from './components/LegalSection';
import { Footer } from './components/Footer';
import type { CustomerModalConfig } from './components/CustomerActivityModal';
import { CommunityFeedbackSection } from './components/CommunityFeedbackSection';

const ExportGitHubPagesModal = lazy(() =>
  import('./components/ExportGitHubPagesModal').then((m) => ({
    default: m.ExportGitHubPagesModal,
  }))
);
const CustomerActivityModal = lazy(() =>
  import('./components/CustomerActivityModal').then((m) => ({
    default: m.CustomerActivityModal,
  }))
);
const ProviderRegistrationModal = lazy(() =>
  import('./components/ProviderRegistrationModal').then((m) => ({
    default: m.ProviderRegistrationModal,
  }))
);
const SubmitFeedbackModal = lazy(() =>
  import('./components/SubmitFeedbackModal').then((m) => ({
    default: m.SubmitFeedbackModal,
  }))
);
const FounderLoginModal = lazy(() =>
  import('./components/FounderLoginModal').then((m) => ({
    default: m.FounderLoginModal,
  }))
);
const FounderCMSDashboard = lazy(() =>
  import('./components/FounderCMSDashboard').then((m) => ({
    default: m.FounderCMSDashboard,
  }))
);
import {
  PublicAnnouncementBar,
  PublicPromotionalBanners,
  PublicUpcomingEventsSection,
} from './components/PublicCMSWidgets';
import { AdSlot } from './components/AdSlot';
import { recordWebsitePageView } from './services/cmsService';
import {
  buildBreadcrumbJsonLdForView,
  getCanonicalUrlForView,
  getViewPath,
  handleSpaLinkClick,
  resolveViewFromLocation,
} from './utils/seoRouting';
import { Eye, LayoutDashboard } from 'lucide-react';

export default function App() {
  const { activeConfig, isFounderAuthorized, previewDraftMode, setPreviewDraftMode } = useCMS();

  const [currentView, setCurrentView] = useState<PageView>(() => resolveViewFromLocation());
  const [activeRoutePath, setActiveRoutePath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const clean = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    return clean || '/';
  });
  const [exportGuideOpen, setExportGuideOpen] = useState(false);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [founderLoginOpen, setFounderLoginOpen] = useState(false);
  const [customerModalConfig, setCustomerModalConfig] = useState<CustomerModalConfig>({
    isOpen: false,
    actionType: '',
    targetFeature: '',
    defaultDetails: '',
  });

  const openCustomerModal = (actionType: string, targetFeature?: string, defaultDetails?: string) => {
    setCustomerModalConfig({
      isOpen: true,
      actionType,
      targetFeature,
      defaultDetails,
    });
  };

  // Sync with both Clean Pathname URLs (/about, /features, /services, /contact) and URL Hash (#about)
  useEffect(() => {
    const syncLocation = () => {
      const resolvedView = resolveViewFromLocation();
      setCurrentView(resolvedView);
      const cleanPath = window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
      setActiveRoutePath(cleanPath);
    };

    syncLocation();
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('hashchange', syncLocation);
    };
  }, []);

  // Apply CMS default theme if user has no explicit localStorage preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('skillconnect-theme');
      if (!savedTheme && activeConfig.customization?.defaultTheme) {
        const root = document.documentElement;
        if (activeConfig.customization.defaultTheme === 'light') {
          root.classList.add('light-theme');
        } else {
          root.classList.remove('light-theme');
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, [activeConfig.customization?.defaultTheme]);

  // Dynamic SEO metadata, self-referencing canonical URL, and robots directives per view
  useEffect(() => {
    const seoPages = activeConfig.seo.pages;
    const isServicesRoute = currentView === 'features' && activeRoutePath === '/services';
    const currentMeta =
      currentView === 'founder-cms'
        ? {
            title: 'Founder CMS & Control Panel – SkillConnect Official',
            description: 'Secure Founder Content Management System for SkillConnect Official.',
          }
        : isServicesRoute
        ? {
            title: 'SkillConnect Services – Hire Verified Talent Across India',
            description:
              'Browse verified skill-based services, freelance talent, peer barter, and 1-on-1 mentorship on SkillConnect Official marketplace across India.',
          }
        : seoPages[currentView] || seoPages.home;

    if (currentMeta) {
      document.title = currentMeta.title;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', currentMeta.description);
      }
      const metaTitle = document.querySelector('meta[name="title"]');
      if (metaTitle) {
        metaTitle.setAttribute('content', currentMeta.title);
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', currentMeta.title);
      }
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', currentMeta.description);
      }
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', currentMeta.title);
      }
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', currentMeta.description);
      }
    }

    if (activeConfig.seo.keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', activeConfig.seo.keywords);
      }
    }

    if (activeConfig.seo.ogImageUrl) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', activeConfig.seo.ogImageUrl);
      }
    }

    if (activeConfig.seo.twitterImageUrl) {
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) {
        twitterImage.setAttribute('content', activeConfig.seo.twitterImageUrl);
      }
    }

    // Ensure public pages never have accidental noindex, and only founder-cms is noindex
    const robotsDirective =
      currentView === 'founder-cms'
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', robotsDirective);
    }
    const googlebotMeta = document.querySelector('meta[name="googlebot"]');
    if (googlebotMeta) {
      googlebotMeta.setAttribute('content', robotsDirective);
    }
    const bingbotMeta = document.querySelector('meta[name="bingbot"]');
    if (bingbotMeta) {
      bingbotMeta.setAttribute('content', robotsDirective);
    }

    // Self-referencing canonical URL, hreflang links, and Open Graph URL per public route
    const targetCanonicalUrl = getCanonicalUrlForView(currentView, activeRoutePath);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', targetCanonicalUrl);
    }
    const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
    hreflangLinks.forEach((linkEl) => {
      linkEl.setAttribute('href', targetCanonicalUrl);
    });
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', targetCanonicalUrl);
    }
    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', targetCanonicalUrl);
    }

    // Update active route BreadcrumbList structured data
    const breadcrumbScript = document.getElementById('active-route-breadcrumb-jsonld');
    if (breadcrumbScript && currentView !== 'founder-cms') {
      breadcrumbScript.textContent = JSON.stringify(
        buildBreadcrumbJsonLdForView(currentView, activeRoutePath)
      );
    }
  }, [currentView, activeRoutePath, activeConfig.seo]);

  const navigateTo = (view: PageView, explicitPath?: string) => {
    setCurrentView(view);
    const targetPath = explicitPath || getViewPath(view);
    setActiveRoutePath(targetPath);
    try {
      if (window.location.pathname !== targetPath || window.location.hash) {
        window.history.pushState({ view, path: targetPath }, '', targetPath);
      }
    } catch {
      window.location.hash = view === 'home' ? '' : `#${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view !== 'founder-cms') {
      recordWebsitePageView(targetPath === '/services' ? 'services' : view);
    }
  };

  const renderHomepageSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <HeroSection key="hero" onNavigate={navigateTo} />;
      case 'banners':
        return <PublicPromotionalBanners key="banners" onNavigate={navigateTo} />;
      case 'about':
        return (
          <div key="about" className="border-t border-white/5">
            <AboutSection onNavigate={navigateTo} />
          </div>
        );
      case 'features':
        return (
          <div key="features" className="border-t border-white/5">
            <FeaturesSection onNavigate={navigateTo} onOpenCustomerModal={openCustomerModal} />
            <AdSlot
              adSlot="8492911917"
              adFormat="horizontal"
              placementName="home-after-features"
            />
          </div>
        );
      case 'events':
        return <PublicUpcomingEventsSection key="events" />;
      case 'showcase':
        return (
          <div key="showcase" className="border-t border-white/5">
            <AppShowcaseSection onNavigate={navigateTo} onOpenCustomerModal={openCustomerModal} />
          </div>
        );
      case 'feedback':
        return (
          <div key="feedback" className="border-t border-white/5">
            <CommunityFeedbackSection
              onNavigate={navigateTo}
              onOpenFeedbackModal={() => setFeedbackModalOpen(true)}
              onOpenProviderModal={() => setProviderModalOpen(true)}
            />
            <AdSlot
              adSlot="8492911918"
              adFormat="auto"
              placementName="home-after-community-feedback"
            />
          </div>
        );
      case 'launch':
        return (
          <div key="launch" className="border-t border-white/5">
            <LaunchInfoSection onNavigate={navigateTo} />
          </div>
        );
      case 'contact':
        return (
          <div key="contact" className="border-t border-white/5">
            <ContactSection onNavigate={navigateTo} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col relative overflow-x-hidden bg-radial-grid">
      {/* Accessible Keyboard Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-cyan-500 focus:text-slate-950 focus:font-bold focus:text-xs focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Top Transparent/Frosted Glass Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenProviderModal={() => setProviderModalOpen(true)}
      />

      {/* Published or Draft-Previewed Announcements Bar */}
      {currentView !== 'founder-cms' && <PublicAnnouncementBar onNavigate={navigateTo} />}

      {/* Main View Router */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {currentView === 'home' && (
          <>
            <HeroSection onNavigate={navigateTo} />
            <PublicPromotionalBanners onNavigate={navigateTo} />
            {activeConfig.homepage.sections
              .filter((sec) => sec.visible)
              .map((sec) => renderHomepageSection(sec.id))}
          </>
        )}

        {currentView === 'about' && (
          <div className="pt-24">
            <AboutSection isStandalonePage onNavigate={navigateTo} />
            <div className="max-w-7xl mx-auto px-4 pb-16 text-center">
              <a
                href={getViewPath('features')}
                onClick={(e) => handleSpaLinkClick(e, 'features', navigateTo)}
                className="inline-block px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg cursor-pointer"
              >
                Proceed to Verified Features →
              </a>
            </div>
          </div>
        )}

        {currentView === 'features' && (
          <div className="pt-24">
            <FeaturesSection
              isStandalonePage
              onNavigate={navigateTo}
              onOpenCustomerModal={openCustomerModal}
            />
            <AdSlot
              adSlot="8492911917"
              adFormat="horizontal"
              placementName="features-page-bottom"
            />
          </div>
        )}

        {currentView === 'showcase' && (
          <div className="pt-24">
            <AppShowcaseSection
              isStandalonePage
              onNavigate={navigateTo}
              onOpenCustomerModal={openCustomerModal}
            />
            <AdSlot
              adSlot="8492911918"
              adFormat="auto"
              placementName="showcase-page-bottom"
            />
          </div>
        )}

        {currentView === 'launch' && (
          <div className="pt-24">
            <LaunchInfoSection isStandalonePage onNavigate={navigateTo} />
            <AdSlot
              adSlot="8492911919"
              adFormat="horizontal"
              placementName="launch-page-bottom"
            />
          </div>
        )}

        {currentView === 'feedback' && (
          <div className="pt-24">
            <CommunityFeedbackSection
              isStandalonePage
              onNavigate={navigateTo}
              onOpenFeedbackModal={() => setFeedbackModalOpen(true)}
              onOpenProviderModal={() => setProviderModalOpen(true)}
            />
            <div className="max-w-7xl mx-auto px-4 pb-16 text-center">
              <a
                href={getViewPath('launch')}
                onClick={(e) => handleSpaLinkClick(e, 'launch', navigateTo)}
                className="inline-block px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg cursor-pointer"
              >
                Proceed to Launch Milestone Information →
              </a>
            </div>
          </div>
        )}

        {currentView === 'contact' && (
          <div className="pt-24">
            <ContactSection isStandalonePage onNavigate={navigateTo} />
          </div>
        )}

        {currentView === 'privacy' && (
          <div className="pt-24">
            <LegalSection initialTab="privacy" onNavigate={navigateTo} />
          </div>
        )}

        {currentView === 'terms' && (
          <div className="pt-24">
            <LegalSection initialTab="terms" onNavigate={navigateTo} />
          </div>
        )}

        {currentView === 'disclaimer' && (
          <div className="pt-24">
            <LegalSection initialTab="disclaimer" onNavigate={navigateTo} />
          </div>
        )}

        {currentView === 'deletion' && (
          <div className="pt-24">
            <AccountDeletionSection isStandalonePage onNavigate={navigateTo} />
          </div>
        )}

        {currentView === 'founder-cms' && (
          <Suspense
            fallback={
              <div className="min-h-[60vh] flex items-center justify-center text-sm text-cyan-300">
                Loading Founder CMS Control Panel...
              </div>
            }
          >
            <FounderCMSDashboard onNavigate={navigateTo} />
          </Suspense>
        )}
      </main>

      {/* Floating Draft Preview Indicator for Authorized Founder */}
      {isFounderAuthorized && previewDraftMode && currentView !== 'founder-cms' && (
        <div className="fixed bottom-5 right-5 z-50 glass-card rounded-2xl p-3.5 border border-amber-400/50 shadow-2xl flex items-center gap-3 bg-[#080d24]/95">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
            <Eye className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>Draft Preview Mode Active</span>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('founder-cms')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-cyan-500/30"
          >
            <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Return to CMS</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDraftMode(false)}
            className="text-[11px] text-slate-300 hover:text-white cursor-pointer"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* Global Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenExportGuide={() => setExportGuideOpen(true)}
        onOpenFounderLogin={() => setFounderLoginOpen(true)}
      />

      {/* Lazy-Loaded Modals */}
      <Suspense fallback={null}>
        {founderLoginOpen && (
          <FounderLoginModal
            isOpen={founderLoginOpen}
            onClose={() => setFounderLoginOpen(false)}
            onOpenDashboard={() => navigateTo('founder-cms')}
          />
        )}

        {exportGuideOpen && (
          <ExportGitHubPagesModal
            isOpen={exportGuideOpen}
            onClose={() => setExportGuideOpen(false)}
          />
        )}

        {customerModalConfig.isOpen && (
          <CustomerActivityModal
            config={customerModalConfig}
            onClose={() => setCustomerModalConfig((prev) => ({ ...prev, isOpen: false }))}
          />
        )}

        {providerModalOpen && (
          <ProviderRegistrationModal
            isOpen={providerModalOpen}
            onClose={() => setProviderModalOpen(false)}
          />
        )}

        {feedbackModalOpen && (
          <SubmitFeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => setFeedbackModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}


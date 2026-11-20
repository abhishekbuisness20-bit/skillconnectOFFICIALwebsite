import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCMS } from '../context/CMSContext';
import {
  saveDraftSiteConfig,
  publishSiteConfig,
  restoreSiteRevision,
  saveCMSBanner,
  deleteCMSBanner,
  saveCMSAnnouncement,
  deleteCMSAnnouncement,
  saveCMSEvent,
  deleteCMSEvent,
  uploadCMSMediaAsset,
  deleteCMSMediaAsset,
  updateCommunityFeedbackStatus,
  updateServiceProviderStatus,
  updateContactInquiryStatus,
  updateActivityReportStatus,
} from '../services/cmsService';
import { requestFounderPasswordReset } from '../lib/firebase';
import {
  PageView,
  CMSBannerItem,
  CMSAnnouncementItem,
  CMSEventItem,
  CMSMediaAssetItem,
  CMSRevisionItem,
  CMSFAQItem,
  FeatureStatus,
  FeatureCategory,
} from '../types';
import { BRAND_CONFIG } from '../data/websiteContent';
import {
  PUBLIC_SITEMAP_ROUTES,
  formatSitemapLastMod,
  generateSitemapXml,
} from '../utils/seoRouting';
import {
  ShieldCheck,
  LayoutDashboard,
  Image as ImageIcon,
  Megaphone,
  Calendar,
  FileText,
  FolderOpen,
  Globe,
  History,
  Save,
  Send,
  Eye,
  LogOut,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Upload,
  ArrowUp,
  ArrowDown,
  Lock,
  RotateCcw,
  Copy,
  Check,
  X,
  EyeOff,
  UserCheck,
  KeyRound,
  Users,
  BarChart3,
  Sliders,
  Bell,
  Search,
  Sparkles,
  Activity,
  HelpCircle,
  MailCheck,
  Menu,
  UserX,
  ShieldAlert,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Sun,
  Moon,
} from 'lucide-react';

interface FounderCMSDashboardProps {
  onNavigate: (view: PageView) => void;
}

type CMSModuleTab =
  | 'analytics'
  | 'homepage'
  | 'banners'
  | 'announcements'
  | 'content'
  | 'users'
  | 'customization'
  | 'events'
  | 'media'
  | 'seo'
  | 'history';

interface UnifiedUserRecord {
  id: string;
  sourceCollection: 'service_providers' | 'contact_inquiries' | 'activity_reports' | 'community_feedback' | 'users';
  name: string;
  email: string;
  phone: string;
  role: 'Service Provider' | 'Customer' | 'Community Tester' | 'Registered User';
  categoryOrSubject: string;
  location: string;
  status: string;
  normalizedStatus: 'active' | 'pending' | 'suspended';
  bioOrDetails: string;
  experienceYears?: number;
  rawDoc: Record<string, any>;
}

/**
 * Smooth Number-Counting Animation Component for Analytics KPI Cards
 */
const AnimatedNumber: React.FC<{ value: number; durationMs?: number; suffix?: string }> = ({
  value,
  durationMs = 900,
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = 0;
    const targetVal = Math.max(0, Number(value) || 0);

    if (targetVal === 0) {
      setDisplayValue(0);
      return;
    }

    let rafId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startVal + (targetVal - startVal) * eased));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [value, durationMs]);

  return (
    <span>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

export const FounderCMSDashboard: React.FC<FounderCMSDashboardProps> = ({ onNavigate }) => {
  const {
    founderUserId,
    isFounderAuthorized,
    authChecking,
    authError,
    clearAuthError,
    signInAsFounder,
    signOutFounder,
    draftConfig,
    setDraftConfig,
    publishedConfig,
    previewDraftMode,
    setPreviewDraftMode,
    allBanners,
    allAnnouncements,
    allEvents,
    mediaAssets,
    revisions,
    auditLogs,
    communitySubmissions,
    contactInquiries,
    serviceProviders,
    activityReports,
    registeredAuthUsers,
    siteTrafficAnalytics,
    refreshFounderCollections,
  } = useCMS();

  // Security Gate Login & Forgot Password State
  const [guardFounderId, setGuardFounderId] = useState('');
  const [guardPassword, setGuardPassword] = useState('');
  const [guardShowPassword, setGuardShowPassword] = useState(false);
  const [guardForgotMode, setGuardForgotMode] = useState(false);
  const [guardResetBusy, setGuardResetBusy] = useState(false);
  const [guardResetMessage, setGuardResetMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<CMSModuleTab>('analytics');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [contentSubTab, setContentSubTab] = useState<
    'about' | 'services' | 'faqs' | 'testimonials' | 'contact' | 'images'
  >('about');

  // User Management Filter & Profile Modal State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<
    'all' | 'Service Provider' | 'Customer' | 'Community Tester'
  >('all');
  const [userStatusFilter, setUserStatusFilter] = useState<
    'all' | 'active' | 'pending' | 'suspended'
  >('all');
  const [selectedUserProfile, setSelectedUserProfile] = useState<UnifiedUserRecord | null>(null);

  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [publishNote, setPublishNote] = useState('');
  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null);
  const [previewMediaItem, setPreviewMediaItem] = useState<CMSMediaAssetItem | null>(null);

  // Delete confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Banner form state
  const [editingBanner, setEditingBanner] = useState<Partial<CMSBannerItem>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    buttonText: 'Explore Now',
    buttonLink: '#features',
    bannerType: 'promotional',
    status: 'published',
    enabled: true,
    startDate: '',
    endDate: '',
  });

  // Announcement form state
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<CMSAnnouncementItem>>({
    title: '',
    message: '',
    type: 'launch',
    linkText: 'View Details',
    linkUrl: '#launch',
    status: 'published',
    startDate: '',
    expiryDate: '',
  });

  // Event form state
  const [editingEvent, setEditingEvent] = useState<Partial<CMSEventItem>>({
    title: '',
    description: '',
    posterUrl: '',
    eventDate: '2026-11-08',
    location: 'Online / Pan-India',
    registrationLink: '',
    status: 'published',
  });

  // Media upload state
  const [mediaCategory, setMediaCategory] = useState<
    'banner' | 'event_poster' | 'seo_social' | 'general'
  >('banner');

  // New Service form state
  const [newService, setNewService] = useState<{
    title: string;
    category: FeatureCategory;
    status: FeatureStatus;
    summary: string;
    iconName: string;
    detailsText: string;
  }>({
    title: '',
    category: 'Exchange & Mentorship',
    status: 'Launch Feature (8 Nov 2026)',
    summary: '',
    iconName: 'Users',
    detailsText: '',
  });

  // New FAQ form state
  const [newFaq, setNewFaq] = useState<{
    question: string;
    answer: string;
    category: CMSFAQItem['category'];
  }>({
    question: '',
    answer: '',
    category: 'General',
  });

  // New Testimonial form state
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    role: '',
    city: '',
    state: '',
    category: 'trades' as 'trades' | 'tech' | 'mentorship',
    rating: 5,
    quote: '',
    featureTested: 'Verified Marketplace',
    badge: 'Verified Early Tester',
  });

  // Selected SEO Page
  const [selectedSeoPage, setSelectedSeoPage] = useState<string>('home');

  const notify = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 5500);
  };

  // Aggregate Unified Real Database Users for User Management & Analytics
  const unifiedUsers = useMemo<UnifiedUserRecord[]>(() => {
    const list: UnifiedUserRecord[] = [];

    serviceProviders.forEach((sp) => {
      const rawStatus = String(sp.status || 'pending_verification');
      const normalizedStatus: 'active' | 'pending' | 'suspended' =
        rawStatus === 'suspended' || rawStatus === 'rejected'
          ? 'suspended'
          : rawStatus === 'approved' || rawStatus === 'active'
          ? 'active'
          : 'pending';
      list.push({
        id: sp.id,
        sourceCollection: 'service_providers',
        name: sp.fullName || 'Service Provider',
        email: sp.email || 'No email',
        phone: sp.phone || 'Not provided',
        role: 'Service Provider',
        categoryOrSubject: sp.category || 'Skilled Professional',
        location: [sp.city, sp.state].filter(Boolean).join(', ') || 'India',
        status: rawStatus,
        normalizedStatus,
        bioOrDetails: sp.bio || '',
        experienceYears: Number(sp.experienceYears) || 0,
        rawDoc: sp,
      });
    });

    contactInquiries.forEach((ci) => {
      const rawStatus = String(ci.status || 'pending');
      const normalizedStatus: 'active' | 'pending' | 'suspended' =
        rawStatus === 'suspended'
          ? 'suspended'
          : rawStatus === 'resolved' || rawStatus === 'reviewed' || rawStatus === 'active'
          ? 'active'
          : 'pending';
      list.push({
        id: ci.id,
        sourceCollection: 'contact_inquiries',
        name: ci.fullName || 'Customer',
        email: ci.email || 'No email',
        phone: 'Via Portal Inquiry',
        role: 'Customer',
        categoryOrSubject: ci.subject || 'General Inquiry',
        location: 'Pan-India',
        status: rawStatus,
        normalizedStatus,
        bioOrDetails: ci.message || '',
        rawDoc: ci,
      });
    });

    activityReports.forEach((ar) => {
      const rawStatus = String(ar.status || 'new');
      const normalizedStatus: 'active' | 'pending' | 'suspended' =
        rawStatus === 'suspended'
          ? 'suspended'
          : rawStatus === 'contacted' || rawStatus === 'in_review' || rawStatus === 'active'
          ? 'active'
          : 'pending';
      list.push({
        id: ar.id,
        sourceCollection: 'activity_reports',
        name: ar.customerName || 'Customer',
        email: ar.customerEmail || 'No email',
        phone: 'Feature Dispatch',
        role: 'Customer',
        categoryOrSubject: ar.actionType || ar.targetFeature || 'Customer Activity',
        location: 'Pan-India',
        status: rawStatus,
        normalizedStatus,
        bioOrDetails: ar.details || '',
        rawDoc: ar,
      });
    });

    communitySubmissions.forEach((cs) => {
      const rawStatus = String(cs.status || 'pending_review');
      const normalizedStatus: 'active' | 'pending' | 'suspended' =
        rawStatus === 'suspended' || rawStatus === 'rejected'
          ? 'suspended'
          : rawStatus === 'approved'
          ? 'active'
          : 'pending';
      list.push({
        id: cs.id,
        sourceCollection: 'community_feedback',
        name: cs.testerName || 'Community Tester',
        email: `${String(cs.testerName || 'tester').toLowerCase().replace(/\s+/g, '.')}@community.skillconnect`,
        phone: 'Verified Beta Cohort',
        role: 'Community Tester',
        categoryOrSubject: `${cs.role || 'Tester'} (${cs.category || 'general'})`,
        location: cs.city || 'India',
        status: rawStatus,
        normalizedStatus,
        bioOrDetails: cs.comment || '',
        rawDoc: cs,
      });
    });

    registeredAuthUsers.forEach((ru) => {
      list.push({
        id: ru.id,
        sourceCollection: 'users',
        name: ru.displayName || 'Registered User',
        email: ru.email || 'No email',
        phone: 'Firebase Auth',
        role: 'Registered User',
        categoryOrSubject: 'Platform Account',
        location: 'India',
        status: 'active',
        normalizedStatus: 'active',
        bioOrDetails: `UID: ${ru.userId || ru.id}`,
        rawDoc: ru,
      });
    });

    return list;
  }, [
    serviceProviders,
    contactInquiries,
    activityReports,
    communitySubmissions,
    registeredAuthUsers,
  ]);

  const filteredUsers = useMemo(() => {
    return unifiedUsers.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userStatusFilter !== 'all' && u.normalizedStatus !== userStatusFilter) return false;
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const match =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q) ||
          u.categoryOrSubject.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [unifiedUsers, userRoleFilter, userStatusFilter, userSearchQuery]);

  // Analytics KPI Calculations from Real Database Data
  const totalRegisteredUsersCount = unifiedUsers.length;
  const activeUsersCount = unifiedUsers.filter((u) => u.normalizedStatus === 'active').length;
  const totalProvidersCount = serviceProviders.length;
  const totalCustomersCount = contactInquiries.length + activityReports.length;
  const pendingVerificationsCount = unifiedUsers.filter(
    (u) => u.normalizedStatus === 'pending'
  ).length;

  // Unauthorized / Unauthenticated Animated Security Gate
  if (!isFounderAuthorized) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center bg-[#040713] relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[360px] h-[260px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="max-w-md w-full glass-card rounded-3xl p-8 border border-cyan-500/35 shadow-[0_0_60px_rgba(0,242,254,0.22)] space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" />

          <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-[0_0_18px_rgba(0,242,254,0.3)] shrink-0">
              <img
                src={BRAND_CONFIG.logoPath}
                alt="SkillConnect Official Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                SkillConnect Security Gate
              </span>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                SkillConnect Founder CMS
              </h1>
            </div>
          </div>

          {guardForgotMode ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                clearAuthError();
                setGuardResetMessage(null);
                setGuardResetBusy(true);
                try {
                  const recoveryEmail = await requestFounderPasswordReset(guardFounderId);
                  setGuardResetMessage({
                    type: 'success',
                    text: `Password recovery initiated via Firebase Auth for ${recoveryEmail}. Check your Founder recovery email inbox.`,
                  });
                } catch (err) {
                  setGuardResetMessage({
                    type: 'error',
                    text:
                      err instanceof Error
                        ? err.message
                        : 'Could not process password recovery request.',
                  });
                } finally {
                  setGuardResetBusy(false);
                }
              }}
              className="space-y-4 text-left"
            >
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Founder Password Recovery</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter your authorized Founder User ID or Email to trigger Firebase Authentication password reset.
                </p>
              </div>

              {guardResetMessage && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                    guardResetMessage.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {guardResetMessage.type === 'success' ? (
                    <MailCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{guardResetMessage.text}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="cms-guard-recovery-id"
                  className="block text-xs font-semibold text-slate-200 mb-1.5"
                >
                  Founder User ID or Email
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="cms-guard-recovery-id"
                    type="text"
                    required
                    value={guardFounderId}
                    onChange={(e) => {
                      setGuardResetMessage(null);
                      setGuardFounderId(e.target.value);
                    }}
                    placeholder="Enter Founder User ID or Email"
                    disabled={guardResetBusy}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={guardResetBusy || !guardFounderId.trim()}
                className="w-full py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {guardResetBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Recovery...</span>
                  </>
                ) : (
                  <>
                    <MailCheck className="w-4 h-4" />
                    <span>Send Password Reset</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setGuardForgotMode(false);
                  setGuardResetMessage(null);
                }}
                className="w-full py-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer text-center"
              >
                ← Back to Founder Login
              </button>
            </form>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-left space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Restricted Founder Control Panel</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Authenticate with your authorized Founder User ID (or Email) and Password. Public registration is disabled.
                </p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  clearAuthError();
                  const ok = await signInAsFounder(guardFounderId, guardPassword);
                  if (ok) {
                    setGuardPassword('');
                    notify('success', 'Founder authentication verified.');
                  }
                }}
                className="space-y-4 text-left"
              >
                <div>
                  <label
                    htmlFor="cms-guard-founder-id"
                    className="block text-xs font-semibold text-slate-200 mb-1.5"
                  >
                    Founder User ID / Email
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="cms-guard-founder-id"
                      type="text"
                      autoComplete="username"
                      required
                      value={guardFounderId}
                      onChange={(e) => {
                        if (authError) clearAuthError();
                        setGuardFounderId(e.target.value);
                      }}
                      placeholder="Enter Founder User ID"
                      disabled={authChecking}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="cms-guard-founder-password"
                      className="block text-xs font-semibold text-slate-200"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        clearAuthError();
                        setGuardResetMessage(null);
                        setGuardForgotMode(true);
                      }}
                      className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="cms-guard-founder-password"
                      type={guardShowPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={guardPassword}
                      onChange={(e) => {
                        if (authError) clearAuthError();
                        setGuardPassword(e.target.value);
                      }}
                      placeholder="Enter Founder Password"
                      disabled={authChecking}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setGuardShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      aria-label={guardShowPassword ? 'Hide password' : 'Show password'}
                      title={guardShowPassword ? 'Hide password' : 'Show password'}
                    >
                      {guardShowPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authChecking || !guardFounderId.trim() || !guardPassword}
                  className="w-full py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Founder Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>LOGIN AS FOUNDER</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white glass-panel transition-colors cursor-pointer"
                >
                  ← Return to Public Website
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  const founderEmail = founderUserId || BRAND_CONFIG.founderEmail;

  const handleSaveDraft = async () => {
    setBusyAction('save-draft');
    try {
      await saveDraftSiteConfig(draftConfig, founderEmail);
      await refreshFounderCollections();
      notify('success', 'Draft saved to Firestore. Toggle "Preview Draft" to inspect before publishing.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save draft.');
    } finally {
      setBusyAction(null);
    }
  };

  const handlePublishLive = async () => {
    setBusyAction('publish-live');
    try {
      await publishSiteConfig(
        draftConfig,
        founderEmail,
        publishNote.trim() || 'Published live update from Founder CMS'
      );
      setPublishNote('');
      await refreshFounderCollections();
      notify(
        'success',
        'Changes published live! Public website and revision snapshot updated.'
      );
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to publish changes.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleSectionMove = (index: number, direction: 'up' | 'down') => {
    const list = [...draftConfig.homepage.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setDraftConfig((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, sections: reordered },
    }));
  };

  const handleSectionToggle = (sectionId: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        sections: prev.homepage.sections.map((s) =>
          s.id === sectionId ? { ...s, visible: !s.visible } : s
        ),
      },
    }));
  };

  const handleUploadFile = async (
    file: File,
    category: 'banner' | 'event_poster' | 'seo_social' | 'general',
    onUrlReady?: (url: string) => void
  ) => {
    setBusyAction(`upload-${category}`);
    try {
      const asset = await uploadCMSMediaAsset(
        file,
        file.name,
        `SkillConnect Official ${category} graphic`,
        category,
        founderEmail
      );
      await refreshFounderCollections();
      if (onUrlReady) onUrlReady(asset.url);
      notify('success', `Uploaded "${asset.title}" and added to Media Manager.`);
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleUserStatusAction = async (
    userItem: UnifiedUserRecord,
    targetAction: 'activate' | 'suspend'
  ) => {
    setBusyAction(`user-${userItem.id}`);
    try {
      if (userItem.sourceCollection === 'service_providers') {
        await updateServiceProviderStatus(
          userItem.id,
          userItem.rawDoc,
          targetAction === 'suspend' ? 'suspended' : 'approved',
          founderEmail
        );
      } else if (userItem.sourceCollection === 'contact_inquiries') {
        await updateContactInquiryStatus(
          userItem.id,
          userItem.rawDoc,
          targetAction === 'suspend' ? 'suspended' : 'active',
          founderEmail
        );
      } else if (userItem.sourceCollection === 'activity_reports') {
        await updateActivityReportStatus(
          userItem.id,
          userItem.rawDoc,
          targetAction === 'suspend' ? 'suspended' : 'active',
          founderEmail
        );
      } else if (userItem.sourceCollection === 'community_feedback') {
        await updateCommunityFeedbackStatus(
          userItem.id,
          userItem.rawDoc,
          targetAction === 'suspend' ? 'suspended' : 'approved',
          founderEmail
        );
      }
      await refreshFounderCollections();
      notify(
        'success',
        `${targetAction === 'suspend' ? 'Suspended' : 'Activated & Verified'} account for "${userItem.name}".`
      );
      if (selectedUserProfile?.id === userItem.id) {
        setSelectedUserProfile(null);
      }
    } catch (err) {
      notify(
        'error',
        err instanceof Error ? err.message : 'Failed to update user account status.'
      );
    } finally {
      setBusyAction(null);
    }
  };

  const isMediaAssetInUse = (url: string): string[] => {
    const usages: string[] = [];
    allBanners.forEach((b) => {
      if (b.imageUrl === url) usages.push(`Banner: ${b.title}`);
    });
    allEvents.forEach((e) => {
      if (e.posterUrl === url) usages.push(`Event: ${e.title}`);
    });
    if (draftConfig.seo.ogImageUrl === url || publishedConfig.seo.ogImageUrl === url) {
      usages.push('SEO OpenGraph Image');
    }
    if (draftConfig.seo.twitterImageUrl === url || publishedConfig.seo.twitterImageUrl === url) {
      usages.push('SEO Twitter Card Image');
    }
    return usages;
  };

  const sidebarModules: Array<{
    id: CMSModuleTab;
    label: string;
    badge?: number;
    icon: React.ElementType;
  }> = [
    { id: 'analytics', label: 'Analytics Overview', icon: BarChart3 },
    { id: 'homepage', label: 'A. Home Page Manager', icon: LayoutDashboard },
    {
      id: 'announcements',
      label: 'B. Announcement Manager',
      badge: allAnnouncements.length,
      icon: Megaphone,
    },
    { id: 'content', label: 'C. Website Content Editor', icon: FileText },
    {
      id: 'users',
      label: 'D. User Management',
      badge: totalRegisteredUsersCount,
      icon: Users,
    },
    { id: 'customization', label: 'E. Website Customization', icon: Sliders },
    {
      id: 'banners',
      label: 'F. Promotional Banners',
      badge: allBanners.length,
      icon: ImageIcon,
    },
    {
      id: 'events',
      label: 'G. Event Manager',
      badge: allEvents.length,
      icon: Calendar,
    },
    {
      id: 'media',
      label: 'H. Media Manager',
      badge: mediaAssets.length,
      icon: FolderOpen,
    },
    { id: 'seo', label: 'I. SEO & Social Cards', icon: Globe },
    {
      id: 'history',
      label: 'J. Audit Logs & Restore',
      badge: revisions.length,
      icon: History,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pt-20 pb-20 bg-[#040713] text-slate-100 relative"
    >
      {/* Top Founder Control Bar */}
      <div className="sticky top-16 z-30 bg-[#070c1f]/95 backdrop-blur-xl border-b border-cyan-500/25 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 cursor-pointer"
                aria-label="Toggle CMS Modules Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <img
                src={BRAND_CONFIG.logoPath}
                alt="SkillConnect Logo"
                className="w-10 h-10 rounded-xl border border-cyan-400/40 object-cover shadow-[0_0_15px_rgba(0,242,254,0.25)]"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    SkillConnect Founder CMS
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono uppercase">
                    Verified Founder
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Signed in as <span className="text-cyan-300">{founderEmail}</span>
                </p>
              </div>
            </div>

            {/* Mobile Notification Bell */}
            <button
              type="button"
              onClick={() => setNotificationDrawerOpen((prev) => !prev)}
              className="lg:hidden relative p-2.5 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 cursor-pointer"
              title="Notifications & Activity Alerts"
            >
              <Bell className="w-4 h-4" />
              {pendingVerificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {pendingVerificationsCount}
                </span>
              )}
            </button>
          </div>

          {/* Publishing, Notification & Preview Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Animated Notification Panel Button */}
            <button
              type="button"
              onClick={() => setNotificationDrawerOpen((prev) => !prev)}
              className="hidden lg:inline-flex relative px-3.5 py-2 rounded-xl text-xs font-semibold glass-panel border border-cyan-500/25 text-cyan-200 hover:border-cyan-400/50 items-center gap-1.5 cursor-pointer transition-all"
              title="Open Animated Notification Panel"
            >
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Alerts</span>
              <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                {pendingVerificationsCount + auditLogs.slice(0, 5).length}
              </span>
            </button>

            <button
              onClick={() => {
                setPreviewDraftMode(!previewDraftMode);
                notify(
                  'info',
                  !previewDraftMode
                    ? 'Draft Preview enabled. Click "View Website" to inspect draft changes before publishing.'
                    : 'Switched back to Published Live view.'
                );
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                previewDraftMode
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'glass-panel border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{previewDraftMode ? 'Draft Preview: ON' : 'Preview Draft'}</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-panel border border-white/10 text-slate-200 hover:text-cyan-300 hover:border-cyan-400/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Website</span>
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={busyAction !== null}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600/25 hover:bg-blue-600/40 border border-blue-400/40 text-blue-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {busyAction === 'save-draft' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Draft</span>
            </button>

            <button
              onClick={handlePublishLive}
              disabled={busyAction !== null}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {busyAction === 'publish-live' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Publish Live</span>
            </button>

            <button
              onClick={async () => {
                await signOutFounder();
                onNavigate('home');
              }}
              className="p-2 rounded-xl glass-panel border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
              title="Logout Founder Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Animated Slide-Over Notification Panel */}
      <AnimatePresence>
        {notificationDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setNotificationDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md h-full bg-[#070c1f] border-l border-cyan-500/30 p-6 overflow-y-auto space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Founder Notification Center
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Real-time platform submissions & audit events
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationDrawerOpen(false)}
                  className="p-1.5 rounded-lg glass-panel text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Pending User Actions */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                  Pending User & Provider Verifications ({pendingVerificationsCount})
                </div>
                {unifiedUsers
                  .filter((u) => u.normalizedStatus === 'pending')
                  .slice(0, 5)
                  .map((u) => (
                    <div
                      key={`${u.sourceCollection}-${u.id}`}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/20 flex items-center justify-between gap-3"
                    >
                      <div className="text-xs">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-cyan-300">
                          {u.role} · {u.categoryOrSubject}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNotificationDrawerOpen(false);
                          setActiveTab('users');
                          setSelectedUserProfile(u);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-[11px] font-semibold cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                {pendingVerificationsCount === 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 text-xs text-slate-400">
                    All registered providers and customer inquiries are reviewed.
                  </div>
                )}
              </div>

              {/* Latest Audit Log Feed */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                  Recent Administrative Actions
                </div>
                {auditLogs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900/75 border border-white/10 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">[{log.module}]</span>
                      <span className="text-[10px] font-mono text-slate-400">{log.action}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{log.summary}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Notification Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AnimatePresence>
          {statusBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                statusBanner.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : statusBanner.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {statusBanner.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{statusBanner.text}</span>
              </div>
              <button
                onClick={() => setStatusBanner(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main CMS Grid: Animated Sidebar + Module Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Animated Module Navigation Sidebar */}
          <aside
            className={`lg:col-span-3 space-y-2 ${
              mobileSidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="glass-card rounded-3xl p-3 border border-cyan-500/20 space-y-1.5">
              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400 flex items-center justify-between">
                <span>Founder Control Modules</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              {sidebarModules.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500/25 via-blue-600/25 to-emerald-500/20 text-white border border-cyan-400/50 shadow-[0_0_20px_rgba(0,242,254,0.15)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{tab.label}</span>
                    </span>
                    {typeof tab.badge === 'number' && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                          active
                            ? 'bg-cyan-400/25 text-cyan-200'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Publish Note Box */}
            <div className="glass-card rounded-2xl p-4 border border-white/10 mt-4 space-y-2.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                Revision Note (Optional)
              </label>
              <input
                type="text"
                value={publishNote}
                onChange={(e) => setPublishNote(e.target.value)}
                placeholder="e.g. Updated homepage headline & FAQs"
                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Every "Publish Live" creates a timestamped snapshot in Firestore so you can safely restore previous content anytime.
              </p>
            </div>
          </aside>

          {/* Right Animated Workspace Area */}
          <div className="lg:col-span-9 space-y-6">
            <AnimatePresence mode="wait">
              {/* MODULE 0: ANALYTICS DASHBOARD */}
              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  {/* Welcome Header Card */}
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/25 bg-gradient-to-br from-slate-900/90 via-[#071128]/90 to-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono uppercase tracking-widest text-cyan-300 mb-2">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>Live Firestore Database Telemetry</span>
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                        SkillConnect Official – Analytics & Command Center
                      </h2>
                      <p className="text-xs text-slate-300 mt-1">
                        Real-time metrics aggregated directly from Firebase Firestore collections and live website traffic.
                      </p>
                    </div>
                    <button
                      onClick={() => refreshFounderCollections()}
                      className="px-4 py-2.5 rounded-xl glass-panel border border-cyan-400/30 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-center cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Sync Live Data</span>
                    </button>
                  </div>

                  {/* Animated KPI Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        label: 'Total Registered Users',
                        value: totalRegisteredUsersCount,
                        sub: 'Across providers, customers & testers',
                        accent: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-300',
                        icon: Users,
                      },
                      {
                        label: 'Active / Verified Users',
                        value: activeUsersCount,
                        sub: `${pendingVerificationsCount} pending review`,
                        accent: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-300',
                        icon: UserCheck,
                      },
                      {
                        label: 'Total Service Providers',
                        value: totalProvidersCount,
                        sub: 'Skilled professionals onboarded',
                        accent: 'from-blue-500/20 to-indigo-600/10 border-blue-500/30 text-blue-300',
                        icon: Briefcase,
                      },
                      {
                        label: 'Total Customers & Inquiries',
                        value: totalCustomersCount,
                        sub: `${contactInquiries.length} inquiries · ${activityReports.length} dispatches`,
                        accent: 'from-purple-500/20 to-pink-600/10 border-purple-500/30 text-purple-300',
                        icon: Mail,
                      },
                      {
                        label: 'Live Website Traffic',
                        value: siteTrafficAnalytics.totalPageViews,
                        sub: `${siteTrafficAnalytics.uniqueSessions} unique visitor sessions`,
                        accent: 'from-cyan-500/20 to-emerald-500/15 border-cyan-400/35 text-cyan-200',
                        icon: Globe,
                      },
                      {
                        label: 'Published CMS Assets',
                        value:
                          allBanners.length +
                          allAnnouncements.length +
                          allEvents.length +
                          (draftConfig.faqs?.length || 0),
                        sub: `${allBanners.length} banners · ${allAnnouncements.length} announcements · ${allEvents.length} events`,
                        accent: 'from-amber-500/20 to-orange-600/10 border-amber-500/30 text-amber-300',
                        icon: Sparkles,
                      },
                    ].map((kpi, idx) => {
                      const Icon = kpi.icon;
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -4 }}
                          className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${kpi.accent} transition-all`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-300">
                              {kpi.label}
                            </span>
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                            <AnimatedNumber value={kpi.value} />
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1.5">{kpi.sub}</div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Interactive Visual Distribution Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: User Ecosystem Distribution */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            Platform User Ecosystem Breakdown
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Distribution across Firestore user & submission collections
                          </p>
                        </div>
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                      </div>

                      <div className="space-y-3 pt-2">
                        {[
                          {
                            label: 'Skilled Service Providers',
                            count: totalProvidersCount,
                            color: 'bg-gradient-to-r from-cyan-400 to-blue-500',
                          },
                          {
                            label: 'Customers & Portal Inquiries',
                            count: totalCustomersCount,
                            color: 'bg-gradient-to-r from-emerald-400 to-teal-500',
                          },
                          {
                            label: 'Verified Community Beta Testers',
                            count: communitySubmissions.length,
                            color: 'bg-gradient-to-r from-purple-400 to-pink-500',
                          },
                          {
                            label: 'Active / Verified Accounts',
                            count: activeUsersCount,
                            color: 'bg-gradient-to-r from-cyan-400 to-emerald-400',
                          },
                        ].map((bar, i) => {
                          const denom = Math.max(1, totalRegisteredUsersCount);
                          const pct = Math.min(100, Math.round((bar.count / denom) * 100));
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300 font-medium">{bar.label}</span>
                                <span className="font-mono text-white font-bold">
                                  {bar.count} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max(6, pct)}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className={`h-full rounded-full ${bar.color}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chart 2: Website Content & Traffic Readiness */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            CMS Content & Website Modules
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Active sections, FAQs, services, and media inventory
                          </p>
                        </div>
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                          <div className="text-[11px] text-slate-400">Enabled Homepage Sections</div>
                          <div className="text-xl font-extrabold text-cyan-300 font-mono mt-1">
                            {draftConfig.homepage.sections.filter((s) => s.visible).length} /{' '}
                            {draftConfig.homepage.sections.length}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                          <div className="text-[11px] text-slate-400">Verified Services Listed</div>
                          <div className="text-xl font-extrabold text-emerald-300 font-mono mt-1">
                            {draftConfig.services.length}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                          <div className="text-[11px] text-slate-400">Published FAQs</div>
                          <div className="text-xl font-extrabold text-purple-300 font-mono mt-1">
                            {(draftConfig.faqs || []).length}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                          <div className="text-[11px] text-slate-400">Uploaded Media Assets</div>
                          <div className="text-xl font-extrabold text-amber-300 font-mono mt-1">
                            {mediaAssets.length}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => setActiveTab('homepage')}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer hover:bg-cyan-500/25"
                        >
                          Edit Homepage →
                        </button>
                        <button
                          onClick={() => setActiveTab('announcements')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-emerald-500/25"
                        >
                          Publish Announcement →
                        </button>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold cursor-pointer hover:bg-blue-500/25"
                        >
                          Manage Users →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activities Feed */}
                  <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Recent Platform & Administrative Activities
                        </h3>
                        <p className="text-xs text-slate-400">
                          Live stream of Founder CMS actions, service provider applications, and customer inquiries
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-xs text-cyan-400 hover:underline cursor-pointer"
                      >
                        View Full Audit Log →
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {auditLogs.slice(0, 6).map((log) => (
                        <div
                          key={log.id}
                          className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                              {log.module}
                            </span>
                            <strong className="text-white">{log.action}:</strong>
                            <span className="text-slate-300">{log.summary}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {log.actorEmail}
                          </span>
                        </div>
                      ))}

                      {auditLogs.length === 0 && (
                        <p className="text-xs text-slate-400">
                          No administrative actions logged yet.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MODULE A: HOME PAGE MANAGER */}
              {activeTab === 'homepage' && (
                <motion.div
                  key="homepage"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          A. Home Page Manager
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Edit homepage headings & descriptions, manage banners, schedule announcements, and enable or disable homepage sections.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setActiveTab('banners')}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer"
                        >
                          Manage Banners ({allBanners.length})
                        </button>
                        <button
                          onClick={() => setActiveTab('announcements')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer"
                        >
                          Schedule Announcements ({allAnnouncements.length})
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Top Tagline Kicker
                        </label>
                        <input
                          type="text"
                          value={draftConfig.homepage.tagline}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              homepage: { ...prev.homepage, tagline: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Target Launch Date Label
                        </label>
                        <input
                          type="text"
                          value={draftConfig.homepage.launchDateString}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              homepage: { ...prev.homepage, launchDateString: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Main Heading (Line 1)
                        </label>
                        <input
                          type="text"
                          value={draftConfig.homepage.mainHeadingLine1}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              homepage: { ...prev.homepage, mainHeadingLine1: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Highlighted Gradient Heading (Line 2)
                        </label>
                        <input
                          type="text"
                          value={draftConfig.homepage.mainHeadingHighlight}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              homepage: {
                                ...prev.homepage,
                                mainHeadingHighlight: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Homepage Hero Description
                      </label>
                      <textarea
                        rows={3}
                        value={draftConfig.homepage.description}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            homepage: { ...prev.homepage, description: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Enable / Disable & Reorder Homepage Sections */}
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Enable, Disable & Reorder Homepage Sections
                        </h3>
                        <p className="text-xs text-slate-400">
                          Control which sections appear on the public SkillConnect homepage and their display order.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {draftConfig.homepage.sections.map((sec, idx) => (
                        <div
                          key={sec.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white">{sec.label}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Section ID: {sec.id}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSectionMove(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg glass-panel text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSectionMove(idx, 'down')}
                              disabled={idx === draftConfig.homepage.sections.length - 1}
                              className="p-1.5 rounded-lg glass-panel text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSectionToggle(sec.id)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                                sec.visible
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border border-white/10'
                              }`}
                            >
                              {sec.visible ? 'Enabled (Visible)' : 'Disabled (Hidden)'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MODULE B / F: BANNER MANAGER */}
              {activeTab === 'banners' && (
                <motion.div
                  key="banners"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Homepage & Promotional Banner Manager
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Add, edit, and delete homepage banners, upload promotional images, and schedule start/end dates.
                        </p>
                      </div>
                      {editingBanner.id && (
                        <button
                          onClick={() =>
                            setEditingBanner({
                              title: '',
                              subtitle: '',
                              imageUrl: '',
                              buttonText: 'Explore Now',
                              buttonLink: '#features',
                              bannerType: 'promotional',
                              status: 'published',
                              enabled: true,
                              startDate: '',
                              endDate: '',
                            })
                          }
                          className="text-xs text-cyan-400 hover:underline cursor-pointer"
                        >
                          + Create New Banner
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Banner Title *
                        </label>
                        <input
                          type="text"
                          value={editingBanner.title || ''}
                          onChange={(e) =>
                            setEditingBanner((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g. Early Service Provider Registration Open"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Banner Type
                        </label>
                        <select
                          value={editingBanner.bannerType || 'promotional'}
                          onChange={(e) =>
                            setEditingBanner((prev) => ({
                              ...prev,
                              bannerType: e.target.value as 'promotional' | 'event',
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        >
                          <option value="promotional">Promotional Banner</option>
                          <option value="event">Event Banner</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Banner Description / Subtitle
                        </label>
                        <input
                          type="text"
                          value={editingBanner.subtitle || ''}
                          onChange={(e) =>
                            setEditingBanner((prev) => ({ ...prev, subtitle: e.target.value }))
                          }
                          placeholder="Short promotional description shown on the banner..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Button Label
                        </label>
                        <input
                          type="text"
                          value={editingBanner.buttonText || ''}
                          onChange={(e) =>
                            setEditingBanner((prev) => ({ ...prev, buttonText: e.target.value }))
                          }
                          placeholder="e.g. Join Beta Network"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Button Target Link (Hash or HTTPS URL)
                        </label>
                        <input
                          type="text"
                          value={editingBanner.buttonLink || ''}
                          onChange={(e) =>
                            setEditingBanner((prev) => ({ ...prev, buttonLink: e.target.value }))
                          }
                          placeholder="#contact or https://..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Schedule Start Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={editingBanner.startDate || ''}
                          onChange={(e) =>
                            setEditingBanner((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Schedule End Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={editingBanner.endDate || ''}
                          onChange={(e) =>
                            setEditingBanner((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-xs font-semibold text-slate-300">
                          Banner Graphic URL or Upload Promotional Image
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            type="text"
                            value={editingBanner.imageUrl || ''}
                            onChange={(e) =>
                              setEditingBanner((prev) => ({ ...prev, imageUrl: e.target.value }))
                            }
                            placeholder="Paste image URL or upload banner image..."
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                          />
                          <label className="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-cyan-500/30">
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {busyAction === 'upload-banner'
                                ? 'Uploading...'
                                : 'Upload Promotional Image'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadFile(file, 'banner', (url) =>
                                    setEditingBanner((prev) => ({ ...prev, imageUrl: url }))
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingBanner.enabled ?? true}
                            onChange={(e) =>
                              setEditingBanner((prev) => ({ ...prev, enabled: e.target.checked }))
                            }
                          />
                          <span>Banner Enabled</span>
                        </label>

                        <select
                          value={editingBanner.status || 'published'}
                          onChange={(e) =>
                            setEditingBanner((prev) => ({
                              ...prev,
                              status: e.target.value as 'draft' | 'published',
                            }))
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (!editingBanner.title?.trim()) {
                          notify('error', 'Please enter a banner title.');
                          return;
                        }
                        setBusyAction('save-banner');
                        try {
                          await saveCMSBanner(
                            {
                              id: editingBanner.id || '',
                              title: editingBanner.title.trim(),
                              subtitle: editingBanner.subtitle || '',
                              imageUrl: editingBanner.imageUrl || '',
                              buttonText: editingBanner.buttonText || '',
                              buttonLink: editingBanner.buttonLink || '',
                              bannerType: editingBanner.bannerType || 'promotional',
                              status: editingBanner.status || 'published',
                              enabled: editingBanner.enabled ?? true,
                              startDate: editingBanner.startDate || '',
                              endDate: editingBanner.endDate || '',
                            },
                            founderEmail
                          );
                          setEditingBanner({
                            title: '',
                            subtitle: '',
                            imageUrl: '',
                            buttonText: 'Explore Now',
                            buttonLink: '#features',
                            bannerType: 'promotional',
                            status: 'published',
                            enabled: true,
                            startDate: '',
                            endDate: '',
                          });
                          await refreshFounderCollections();
                          notify('success', 'Banner saved successfully.');
                        } catch (err) {
                          notify(
                            'error',
                            err instanceof Error ? err.message : 'Failed to save banner.'
                          );
                        } finally {
                          setBusyAction(null);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingBanner.id ? 'Update Banner' : 'Save Banner'}</span>
                    </button>
                  </div>

                  {/* Existing Banners List */}
                  <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
                    <h3 className="text-sm font-bold text-white">
                      Existing Banners ({allBanners.length})
                    </h3>
                    {allBanners.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        No promotional banners created yet. Use the form above to publish a banner.
                      </p>
                    ) : (
                      allBanners.map((b) => (
                        <div
                          key={b.id}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            {b.imageUrl && (
                              <img
                                src={b.imageUrl}
                                alt={b.title}
                                className="w-16 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{b.title}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                    b.status === 'published' && b.enabled
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}
                                >
                                  {b.enabled ? b.status : 'Disabled'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {b.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingBanner(b)}
                              className="p-2 rounded-lg glass-panel text-cyan-300 hover:text-white cursor-pointer"
                              title="Edit Banner"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  title: 'Delete Promotional Banner',
                                  message: `Are you sure you want to permanently delete banner "${b.title}"?`,
                                  onConfirm: async () => {
                                    await deleteCMSBanner(b.id, b.title, founderEmail);
                                    await refreshFounderCollections();
                                    notify('info', `Deleted banner "${b.title}".`);
                                  },
                                })
                              }
                              className="p-2 rounded-lg glass-panel text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                              title="Delete Banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* MODULE B: ANNOUNCEMENT MANAGER */}
              {activeTab === 'announcements' && (
                <motion.div
                  key="announcements"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-white">B. Announcement Manager</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Publish launch announcements, add festival greetings, create promotional notifications, and set expiry dates.
                        </p>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingAnnouncement({
                              title: 'Official Launch Countdown',
                              message:
                                'SkillConnect Official Android release on Google Play Store is scheduled for 8 November 2026!',
                              type: 'launch',
                              linkText: 'Launch Roadmap',
                              linkUrl: '#launch',
                              status: 'published',
                              startDate: '',
                              expiryDate: '2026-11-09',
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold cursor-pointer"
                        >
                          + Launch Preset
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingAnnouncement({
                              title: 'Warm Festival Greetings from SkillConnect',
                              message:
                                'Wishing all skilled professionals, creators, and families across India joy, prosperity, and success!',
                              type: 'festival',
                              linkText: 'Join Community',
                              linkUrl: '#feedback',
                              status: 'published',
                              startDate: '',
                              expiryDate: '',
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold cursor-pointer"
                        >
                          + Festival Greeting
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Announcement Title *
                        </label>
                        <input
                          type="text"
                          value={editingAnnouncement.title || ''}
                          onChange={(e) =>
                            setEditingAnnouncement((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g. Official Launch Countdown / Festival Greetings"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Announcement Type / Category Badge
                        </label>
                        <select
                          value={editingAnnouncement.type || 'info'}
                          onChange={(e) =>
                            setEditingAnnouncement((prev) => ({
                              ...prev,
                              type: e.target.value as
                                | 'info'
                                | 'launch'
                                | 'event'
                                | 'alert'
                                | 'festival',
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        >
                          <option value="launch">Launch Announcement</option>
                          <option value="festival">Festival Greeting</option>
                          <option value="info">Promotional / Info Notification</option>
                          <option value="event">Platform Event</option>
                          <option value="alert">Important Security / System Alert</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Announcement Message *
                        </label>
                        <input
                          type="text"
                          value={editingAnnouncement.message || ''}
                          onChange={(e) =>
                            setEditingAnnouncement((prev) => ({ ...prev, message: e.target.value }))
                          }
                          placeholder="e.g. SkillConnect Official Android release is scheduled for 8 November 2026."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Start Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={editingAnnouncement.startDate || ''}
                          onChange={(e) =>
                            setEditingAnnouncement((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Expiry Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={editingAnnouncement.expiryDate || ''}
                          onChange={(e) =>
                            setEditingAnnouncement((prev) => ({
                              ...prev,
                              expiryDate: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          CTA Link Text (Optional)
                        </label>
                        <input
                          type="text"
                          value={editingAnnouncement.linkText || ''}
                          onChange={(e) =>
                            setEditingAnnouncement((prev) => ({
                              ...prev,
                              linkText: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          CTA Link URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={editingAnnouncement.linkUrl || ''}
                          onChange={(e) =>
                            setEditingAnnouncement((prev) => ({
                              ...prev,
                              linkUrl: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Publish Status
                        </label>
                        <select
                          value={editingAnnouncement.status || 'published'}
                          onChange={(e) =>
                            setEditingAnnouncement((prev) => ({
                              ...prev,
                              status: e.target.value as 'draft' | 'published',
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        >
                          <option value="published">Published (Live)</option>
                          <option value="draft">Unpublished (Draft)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (
                          !editingAnnouncement.title?.trim() ||
                          !editingAnnouncement.message?.trim()
                        ) {
                          notify('error', 'Please enter both title and message.');
                          return;
                        }
                        await saveCMSAnnouncement(
                          {
                            id: editingAnnouncement.id || '',
                            title: editingAnnouncement.title.trim(),
                            message: editingAnnouncement.message.trim(),
                            type: editingAnnouncement.type || 'info',
                            linkText: editingAnnouncement.linkText || '',
                            linkUrl: editingAnnouncement.linkUrl || '',
                            status: editingAnnouncement.status || 'published',
                            startDate: editingAnnouncement.startDate || '',
                            expiryDate: editingAnnouncement.expiryDate || '',
                          },
                          founderEmail
                        );
                        setEditingAnnouncement({
                          title: '',
                          message: '',
                          type: 'launch',
                          linkText: 'View Details',
                          linkUrl: '#launch',
                          status: 'published',
                          startDate: '',
                          expiryDate: '',
                        });
                        await refreshFounderCollections();
                        notify('success', 'Announcement saved and synced with live website.');
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {editingAnnouncement.id ? 'Update Announcement' : 'Publish Announcement'}
                      </span>
                    </button>
                  </div>

                  {/* Existing Announcements */}
                  <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
                    <h3 className="text-sm font-bold text-white">
                      Active & Scheduled Announcements ({allAnnouncements.length})
                    </h3>
                    {allAnnouncements.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        No announcements published yet. Use the form or quick presets above to create one.
                      </p>
                    ) : (
                      allAnnouncements.map((a) => (
                        <div
                          key={a.id}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase">
                                {a.type}
                              </span>
                              <span className="text-xs font-bold text-white">{a.title}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                  a.status === 'published'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {a.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{a.message}</p>
                            {(a.startDate || a.expiryDate) && (
                              <p className="text-[10px] text-slate-400 font-mono mt-1">
                                Schedule: {a.startDate || 'Immediate'} →{' '}
                                {a.expiryDate || 'No Expiry'}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                await saveCMSAnnouncement(
                                  {
                                    ...a,
                                    status: a.status === 'published' ? 'draft' : 'published',
                                  },
                                  founderEmail
                                );
                                await refreshFounderCollections();
                                notify(
                                  'info',
                                  `Announcement "${a.title}" is now ${
                                    a.status === 'published' ? 'unpublished (draft)' : 'published'
                                  }.`
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg glass-panel text-[11px] text-cyan-300 hover:text-white cursor-pointer"
                            >
                              {a.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              onClick={() => setEditingAnnouncement(a)}
                              className="p-2 rounded-lg glass-panel text-slate-300 hover:text-white cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  title: 'Delete Announcement',
                                  message: `Are you sure you want to delete announcement "${a.title}"?`,
                                  onConfirm: async () => {
                                    await deleteCMSAnnouncement(a.id, a.title, founderEmail);
                                    await refreshFounderCollections();
                                    notify('info', 'Announcement deleted.');
                                  },
                                })
                              }
                              className="p-2 rounded-lg glass-panel text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* MODULE C: WEBSITE CONTENT EDITOR */}
              {activeTab === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  {/* Sub-tabs */}
                  <div className="flex flex-wrap gap-2 p-1.5 glass-panel rounded-2xl w-fit">
                    {[
                      { id: 'about', label: 'About Us' },
                      { id: 'services', label: `Services (${draftConfig.services.length})` },
                      { id: 'faqs', label: `FAQs (${(draftConfig.faqs || []).length})` },
                      {
                        id: 'testimonials',
                        label: `Testimonials (${draftConfig.testimonials.length})`,
                      },
                      { id: 'contact', label: 'Contact & Socials' },
                      { id: 'images', label: `Website Images (${mediaAssets.length})` },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setContentSubTab(st.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          contentSubTab === st.id
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub-tab 1: About Us */}
                  {contentSubTab === 'about' && (
                    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-4">
                      <h3 className="text-lg font-bold text-white">Edit About Us Page Content</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Section Kicker
                          </label>
                          <input
                            type="text"
                            value={draftConfig.about.kicker}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                about: { ...prev.about, kicker: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            About Us Main Heading
                          </label>
                          <input
                            type="text"
                            value={draftConfig.about.heading}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                about: { ...prev.about, heading: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Introductory Mission Paragraph
                        </label>
                        <textarea
                          rows={3}
                          value={draftConfig.about.introParagraph}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              about: { ...prev.about, introParagraph: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Founder Quote Paragraph 1
                        </label>
                        <textarea
                          rows={2}
                          value={draftConfig.about.founderQuote1}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              about: { ...prev.about, founderQuote1: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Founder Quote Paragraph 2
                        </label>
                        <textarea
                          rows={2}
                          value={draftConfig.about.founderQuote2}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              about: { ...prev.about, founderQuote2: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-3 border-t border-white/10 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                          Core Architectural Pillars
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {draftConfig.about.pillars.map((pillar, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2"
                            >
                              <input
                                type="text"
                                value={pillar.title}
                                onChange={(e) => {
                                  const updated = [...draftConfig.about.pillars];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setDraftConfig((prev) => ({
                                    ...prev,
                                    about: { ...prev.about, pillars: updated },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs font-bold text-white"
                              />
                              <textarea
                                rows={3}
                                value={pillar.description}
                                onChange={(e) => {
                                  const updated = [...draftConfig.about.pillars];
                                  updated[idx] = { ...updated[idx], description: e.target.value };
                                  setDraftConfig((prev) => ({
                                    ...prev,
                                    about: { ...prev.about, pillars: updated },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-300"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 2: Services / Verified Features */}
                  {contentSubTab === 'services' && (
                    <div className="space-y-6">
                      <div className="glass-card rounded-3xl p-6 border border-cyan-500/20 space-y-4">
                        <h3 className="text-base font-bold text-white">
                          Add New Verified Service / Platform Feature
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Service / Feature Title"
                            value={newService.title}
                            onChange={(e) =>
                              setNewService((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                          <select
                            value={newService.category}
                            onChange={(e) =>
                              setNewService((prev) => ({
                                ...prev,
                                category: e.target.value as FeatureCategory,
                              }))
                            }
                            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          >
                            <option value="Exchange & Mentorship">Exchange & Mentorship</option>
                            <option value="Portfolios & Verification">
                              Portfolios & Verification
                            </option>
                            <option value="Apprenticeship & Gigs">Apprenticeship & Gigs</option>
                            <option value="Platform Security">Platform Security</option>
                          </select>
                          <select
                            value={newService.status}
                            onChange={(e) =>
                              setNewService((prev) => ({
                                ...prev,
                                status: e.target.value as FeatureStatus,
                              }))
                            }
                            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          >
                            <option value="Launch Feature (8 Nov 2026)">
                              Launch Feature (8 Nov 2026)
                            </option>
                            <option value="Core Architecture">Core Architecture</option>
                            <option value="In Development (Post-Launch)">
                              In Development (Post-Launch)
                            </option>
                          </select>
                          <input
                            type="text"
                            placeholder="Comma-separated bullet points"
                            value={newService.detailsText}
                            onChange={(e) =>
                              setNewService((prev) => ({ ...prev, detailsText: e.target.value }))
                            }
                            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                          <textarea
                            rows={2}
                            placeholder="Service summary description..."
                            value={newService.summary}
                            onChange={(e) =>
                              setNewService((prev) => ({ ...prev, summary: e.target.value }))
                            }
                            className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!newService.title.trim() || !newService.summary.trim()) {
                              notify('error', 'Enter service title and summary.');
                              return;
                            }
                            setDraftConfig((prev) => ({
                              ...prev,
                              services: [
                                ...prev.services,
                                {
                                  id: `srv-${Date.now()}`,
                                  title: newService.title.trim(),
                                  category: newService.category,
                                  status: newService.status,
                                  summary: newService.summary.trim(),
                                  iconName: newService.iconName,
                                  details: newService.detailsText
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                },
                              ],
                            }));
                            setNewService({
                              title: '',
                              category: 'Exchange & Mentorship',
                              status: 'Launch Feature (8 Nov 2026)',
                              summary: '',
                              iconName: 'Users',
                              detailsText: '',
                            });
                            notify(
                              'info',
                              'Service added to draft. Click "Save Draft" or "Publish Live" to apply.'
                            );
                          }}
                          className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold cursor-pointer"
                        >
                          + Add Service to Draft
                        </button>
                      </div>

                      <div className="space-y-3">
                        {draftConfig.services.map((srv, idx) => (
                          <div
                            key={srv.id}
                            className="glass-card rounded-2xl p-4 border border-white/10 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={srv.title}
                                onChange={(e) => {
                                  const updated = [...draftConfig.services];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setDraftConfig((prev) => ({ ...prev, services: updated }));
                                }}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-bold text-white"
                              />
                              <button
                                onClick={() =>
                                  setConfirmDelete({
                                    title: 'Remove Service Item',
                                    message: `Remove "${srv.title}" from Services list?`,
                                    onConfirm: async () => {
                                      setDraftConfig((prev) => ({
                                        ...prev,
                                        services: prev.services.filter((s) => s.id !== srv.id),
                                      }));
                                    },
                                  })
                                }
                                className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={srv.summary}
                              onChange={(e) => {
                                const updated = [...draftConfig.services];
                                updated[idx] = { ...updated[idx], summary: e.target.value };
                                setDraftConfig((prev) => ({ ...prev, services: updated }));
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 3: Manage FAQs */}
                  {contentSubTab === 'faqs' && (
                    <div className="space-y-6">
                      <div className="glass-card rounded-3xl p-6 border border-cyan-500/20 space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-white">
                            Manage Platform FAQs (Live on Website)
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Add, update, or remove Frequently Asked Questions displayed on the public SkillConnect Launch & FAQ page.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="FAQ Question *"
                            value={newFaq.question}
                            onChange={(e) =>
                              setNewFaq((prev) => ({ ...prev, question: e.target.value }))
                            }
                            className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                          <select
                            value={newFaq.category}
                            onChange={(e) =>
                              setNewFaq((prev) => ({
                                ...prev,
                                category: e.target.value as CMSFAQItem['category'],
                              }))
                            }
                            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          >
                            <option value="General">General</option>
                            <option value="Providers">Providers</option>
                            <option value="Customers">Customers</option>
                            <option value="Security & Launch">Security & Launch</option>
                          </select>
                          <textarea
                            rows={2}
                            placeholder="Detailed FAQ Answer *"
                            value={newFaq.answer}
                            onChange={(e) =>
                              setNewFaq((prev) => ({ ...prev, answer: e.target.value }))
                            }
                            className="sm:col-span-3 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>

                        <button
                          onClick={() => {
                            if (!newFaq.question.trim() || !newFaq.answer.trim()) {
                              notify('error', 'Please enter both FAQ question and answer.');
                              return;
                            }
                            setDraftConfig((prev) => ({
                              ...prev,
                              faqs: [
                                ...(prev.faqs || []),
                                {
                                  id: `faq_${Date.now()}`,
                                  question: newFaq.question.trim(),
                                  answer: newFaq.answer.trim(),
                                  category: newFaq.category,
                                },
                              ],
                            }));
                            setNewFaq({ question: '', answer: '', category: 'General' });
                            notify(
                              'info',
                              'FAQ added to draft. Click "Save Draft" or "Publish Live" to update the website.'
                            );
                          }}
                          className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold cursor-pointer"
                        >
                          + Add FAQ to Draft
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(draftConfig.faqs || []).map((faq, idx) => (
                          <div
                            key={faq.id}
                            className="glass-card rounded-2xl p-4 border border-white/10 space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 uppercase">
                                {faq.category}
                              </span>
                              <button
                                onClick={() =>
                                  setConfirmDelete({
                                    title: 'Delete FAQ Item',
                                    message: `Remove FAQ "${faq.question}" from the website?`,
                                    onConfirm: async () => {
                                      setDraftConfig((prev) => ({
                                        ...prev,
                                        faqs: (prev.faqs || []).filter((item) => item.id !== faq.id),
                                      }));
                                    },
                                  })
                                }
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const updated = [...(draftConfig.faqs || [])];
                                updated[idx] = { ...updated[idx], question: e.target.value };
                                setDraftConfig((prev) => ({ ...prev, faqs: updated }));
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-bold text-white"
                            />
                            <textarea
                              rows={2}
                              value={faq.answer}
                              onChange={(e) => {
                                const updated = [...(draftConfig.faqs || [])];
                                updated[idx] = { ...updated[idx], answer: e.target.value };
                                setDraftConfig((prev) => ({ ...prev, faqs: updated }));
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 4: Testimonials & Community Moderation */}
                  {contentSubTab === 'testimonials' && (
                    <div className="space-y-6">
                      <div className="glass-card rounded-3xl p-6 border border-cyan-500/20 space-y-4">
                        <h3 className="text-base font-bold text-white">
                          Add Verified Early Tester Testimonial
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Tester Name"
                            value={newTestimonial.name}
                            onChange={(e) =>
                              setNewTestimonial((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Role / Profession"
                            value={newTestimonial.role}
                            onChange={(e) =>
                              setNewTestimonial((prev) => ({ ...prev, role: e.target.value }))
                            }
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="City"
                            value={newTestimonial.city}
                            onChange={(e) =>
                              setNewTestimonial((prev) => ({ ...prev, city: e.target.value }))
                            }
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={newTestimonial.state}
                            onChange={(e) =>
                              setNewTestimonial((prev) => ({ ...prev, state: e.target.value }))
                            }
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                          <select
                            value={newTestimonial.category}
                            onChange={(e) =>
                              setNewTestimonial((prev) => ({
                                ...prev,
                                category: e.target.value as any,
                              }))
                            }
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          >
                            <option value="trades">Skilled Trades</option>
                            <option value="tech">Developers & Tech</option>
                            <option value="mentorship">Mentors & Educators</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Feature Tested"
                            value={newTestimonial.featureTested}
                            onChange={(e) =>
                              setNewTestimonial((prev) => ({
                                ...prev,
                                featureTested: e.target.value,
                              }))
                            }
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                          <textarea
                            rows={2}
                            placeholder="Authentic testimonial quote..."
                            value={newTestimonial.quote}
                            onChange={(e) =>
                              setNewTestimonial((prev) => ({ ...prev, quote: e.target.value }))
                            }
                            className="sm:col-span-3 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!newTestimonial.name.trim() || !newTestimonial.quote.trim()) {
                              notify('error', 'Enter tester name and quote.');
                              return;
                            }
                            const initials = newTestimonial.name
                              .trim()
                              .split(' ')
                              .map((p) => p[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase();
                            setDraftConfig((prev) => ({
                              ...prev,
                              testimonials: [
                                {
                                  id: `test-${Date.now()}`,
                                  name: newTestimonial.name.trim(),
                                  role: newTestimonial.role.trim() || 'Early Tester',
                                  city: newTestimonial.city.trim() || 'New Delhi',
                                  state: newTestimonial.state.trim() || 'India',
                                  category: newTestimonial.category,
                                  rating: 5,
                                  quote: newTestimonial.quote.trim(),
                                  featureTested: newTestimonial.featureTested,
                                  badge: newTestimonial.badge,
                                  avatarInitials: initials || 'SC',
                                  avatarColor: 'from-cyan-500 to-blue-600',
                                  date: 'Pre-Launch Beta',
                                },
                                ...prev.testimonials,
                              ],
                            }));
                            setNewTestimonial({
                              name: '',
                              role: '',
                              city: '',
                              state: '',
                              category: 'trades',
                              rating: 5,
                              quote: '',
                              featureTested: 'Verified Marketplace',
                              badge: 'Verified Early Tester',
                            });
                            notify('info', 'Testimonial added to draft.');
                          }}
                          className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold cursor-pointer"
                        >
                          + Add Testimonial to Draft
                        </button>
                      </div>

                      {/* Manage Existing Testimonials */}
                      <div className="space-y-3">
                        {draftConfig.testimonials.map((t, idx) => (
                          <div
                            key={t.id}
                            className="glass-card rounded-2xl p-4 border border-white/10 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">
                                {t.name} · {t.city}, {t.state}
                              </span>
                              <button
                                onClick={() =>
                                  setConfirmDelete({
                                    title: 'Remove Testimonial',
                                    message: `Remove testimonial by "${t.name}" from draft?`,
                                    onConfirm: async () => {
                                      setDraftConfig((prev) => ({
                                        ...prev,
                                        testimonials: prev.testimonials.filter(
                                          (item) => item.id !== t.id
                                        ),
                                      }));
                                    },
                                  })
                                }
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={t.quote}
                              onChange={(e) => {
                                const updated = [...draftConfig.testimonials];
                                updated[idx] = { ...updated[idx], quote: e.target.value };
                                setDraftConfig((prev) => ({ ...prev, testimonials: updated }));
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Community Feedback Submissions from Firestore */}
                      {communitySubmissions.length > 0 && (
                        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
                          <h4 className="text-sm font-bold text-white">
                            User-Submitted Community Feedback ({communitySubmissions.length})
                          </h4>
                          {communitySubmissions.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <strong className="text-white">
                                  {sub.testerName || sub.fullName}
                                </strong>{' '}
                                ({sub.city}) — <span className="text-cyan-300">{sub.status}</span>
                                <p className="text-slate-300 mt-1">
                                  "{sub.comment || sub.quote}"
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={async () => {
                                    await updateCommunityFeedbackStatus(
                                      sub.id,
                                      sub,
                                      'approved',
                                      founderEmail
                                    );
                                    await refreshFounderCollections();
                                    notify(
                                      'success',
                                      `Approved submission by ${sub.testerName || sub.fullName}`
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={async () => {
                                    await updateCommunityFeedbackStatus(
                                      sub.id,
                                      sub,
                                      'rejected',
                                      founderEmail
                                    );
                                    await refreshFounderCollections();
                                    notify(
                                      'info',
                                      `Rejected submission by ${sub.testerName || sub.fullName}`
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 5: Contact & Social Links */}
                  {contentSubTab === 'contact' && (
                    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-4">
                      <h3 className="text-lg font-bold text-white">
                        Contact & Social Media Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Contact Page Heading
                          </label>
                          <input
                            type="text"
                            value={draftConfig.contact.contactHeading}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                contact: { ...prev.contact, contactHeading: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Official Founder Email
                          </label>
                          <input
                            type="email"
                            value={draftConfig.contact.founderEmail}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                contact: { ...prev.contact, founderEmail: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Platform Official Instagram URL
                          </label>
                          <input
                            type="url"
                            value={draftConfig.contact.platformInstagramUrl}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                contact: {
                                  ...prev.contact,
                                  platformInstagramUrl: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Founder Instagram URL
                          </label>
                          <input
                            type="url"
                            value={draftConfig.contact.founderInstagramUrl}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                contact: {
                                  ...prev.contact,
                                  founderInstagramUrl: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Founder Instagram Handle
                          </label>
                          <input
                            type="text"
                            value={draftConfig.contact.founderInstagramHandle}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                contact: {
                                  ...prev.contact,
                                  founderInstagramHandle: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Response SLA Statement
                          </label>
                          <input
                            type="text"
                            value={draftConfig.contact.responseSla}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                contact: { ...prev.contact, responseSla: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Contact Page Subtitle
                          </label>
                          <textarea
                            rows={2}
                            value={draftConfig.contact.contactSubtitle}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                contact: { ...prev.contact, contactSubtitle: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 6: Website Images Quick-Manager */}
                  {contentSubTab === 'images' && (
                    <div className="glass-card rounded-3xl p-6 border border-cyan-500/20 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-white">
                            Manage Website Images & Graphics
                          </h3>
                          <p className="text-xs text-slate-400">
                            Upload new website images to Firebase Storage or open the full Media Manager.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadFile(file, 'general');
                              }}
                            />
                          </label>
                          <button
                            onClick={() => setActiveTab('media')}
                            className="px-3.5 py-2 rounded-xl glass-panel text-xs text-cyan-300 hover:text-white cursor-pointer"
                          >
                            Full Media Library →
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {mediaAssets.slice(0, 8).map((m) => (
                          <div
                            key={m.id}
                            onClick={() => setPreviewMediaItem(m)}
                            className="rounded-xl overflow-hidden border border-white/10 bg-slate-900 cursor-pointer group"
                          >
                            <img
                              src={m.url}
                              alt={m.title}
                              className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="p-2 text-[11px] text-slate-300 truncate">{m.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* MODULE D: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          D. User Management & Account Authorization
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          View registered users, search & filter profiles, inspect customer and service provider accounts, and activate or suspend accounts with Founder authorization.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                          Total: {unifiedUsers.length}
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          Active: {activeUsersCount}
                        </span>
                      </div>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6 relative">
                        <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          placeholder="Search by name, email, phone, skill category, or city..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        >
                          <option value="all">All Roles ({unifiedUsers.length})</option>
                          <option value="Service Provider">
                            Service Providers ({totalProvidersCount})
                          </option>
                          <option value="Customer">Customers ({totalCustomersCount})</option>
                          <option value="Community Tester">
                            Community Testers ({communitySubmissions.length})
                          </option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <select
                          value={userStatusFilter}
                          onChange={(e) => setUserStatusFilter(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        >
                          <option value="all">All Statuses</option>
                          <option value="active">Active / Verified</option>
                          <option value="pending">Pending Verification</option>
                          <option value="suspended">Suspended / Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* User Records List */}
                    <div className="space-y-3">
                      {filteredUsers.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/5 text-center text-xs text-slate-400">
                          No matching user profiles found for the current search/filter criteria.
                        </div>
                      ) : (
                        filteredUsers.map((u) => {
                          const statusBadge =
                            u.normalizedStatus === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : u.normalizedStatus === 'suspended'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                          const roleBadge =
                            u.role === 'Service Provider'
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : u.role === 'Customer'
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              : 'bg-purple-500/15 text-purple-300 border-purple-500/30';

                          return (
                            <motion.div
                              key={`${u.sourceCollection}-${u.id}`}
                              whileHover={{ y: -2 }}
                              className="p-4 rounded-2xl bg-slate-900/85 border border-white/10 hover:border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-white">{u.name}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${roleBadge}`}
                                  >
                                    {u.role}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase border ${statusBadge}`}
                                  >
                                    {u.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                  <span className="inline-flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-cyan-400" />
                                    <span>{u.email}</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <Briefcase className="w-3 h-3 text-emerald-400" />
                                    <span>{u.categoryOrSubject}</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-purple-400" />
                                    <span>{u.location}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                  onClick={() => setSelectedUserProfile(u)}
                                  className="px-3 py-1.5 rounded-xl glass-panel border border-white/10 text-xs text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Profile</span>
                                </button>

                                {u.normalizedStatus !== 'active' &&
                                  u.sourceCollection !== 'users' && (
                                    <button
                                      disabled={busyAction === `user-${u.id}`}
                                      onClick={() => handleUserStatusAction(u, 'activate')}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>Activate</span>
                                    </button>
                                  )}

                                {u.normalizedStatus !== 'suspended' &&
                                  u.sourceCollection !== 'users' && (
                                    <button
                                      disabled={busyAction === `user-${u.id}`}
                                      onClick={() =>
                                        setConfirmDelete({
                                          title: `Suspend ${u.role} Account`,
                                          message: `Are you sure you want to suspend "${u.name}" (${u.email})? This action will be recorded in the Founder Audit Log.`,
                                          onConfirm: async () => {
                                            await handleUserStatusAction(u, 'suspend');
                                          },
                                        })
                                      }
                                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    >
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>Suspend</span>
                                    </button>
                                  )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MODULE E: WEBSITE CUSTOMIZATION */}
              {activeTab === 'customization' && (
                <motion.div
                  key="customization"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        E. Website Customization & Theme Preferences
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Manage homepage section visibility, change supported theme settings, update promotional display options, and preview changes before publishing.
                      </p>
                    </div>

                    {/* Theme & Visual Mode Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-900/85 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            Default Website Theme Mode
                          </span>
                          {draftConfig.customization?.defaultTheme === 'light' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Sets the default theme for first-time visitors (visitors can also toggle Dark/Light mode anytime in the Navbar).
                        </p>
                        <div className="flex gap-2">
                          {(['dark', 'light'] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() =>
                                setDraftConfig((prev) => ({
                                  ...prev,
                                  customization: {
                                    ...(prev.customization || {
                                      defaultTheme: 'dark',
                                      accentPreset: 'cyan-emerald',
                                      showAnnouncementBar: true,
                                      showPromotionalBanners: true,
                                      promoRibbonText: '',
                                    }),
                                    defaultTheme: mode,
                                  },
                                }))
                              }
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold capitalize border cursor-pointer ${
                                (draftConfig.customization?.defaultTheme || 'dark') === mode
                                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                                  : 'bg-slate-950 border-white/10 text-slate-400'
                              }`}
                            >
                              {mode} Mode
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900/85 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            Brand Gradient Accent Preset
                          </span>
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Select the primary SkillConnect gradient accent profile.
                        </p>
                        <select
                          value={draftConfig.customization?.accentPreset || 'cyan-emerald'}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              customization: {
                                ...(prev.customization || {
                                  defaultTheme: 'dark',
                                  accentPreset: 'cyan-emerald',
                                  showAnnouncementBar: true,
                                  showPromotionalBanners: true,
                                  promoRibbonText: '',
                                }),
                                accentPreset: e.target.value as any,
                              },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                        >
                          <option value="cyan-emerald">Cyan & Emerald Security Glow (Default)</option>
                          <option value="blue-purple">Electric Cyan & Royal Indigo</option>
                          <option value="emerald-cyan">Emerald Matrix & Deep Navy</option>
                        </select>
                      </div>
                    </div>

                    {/* Promotional Visibility Switches */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="p-4 rounded-2xl bg-slate-900/85 border border-white/10 flex items-center justify-between gap-3 cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-white">
                            Show Top Announcement Bar
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Display published announcements & festival greetings at the top of the website
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={draftConfig.customization?.showAnnouncementBar ?? true}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              customization: {
                                ...(prev.customization || {
                                  defaultTheme: 'dark',
                                  accentPreset: 'cyan-emerald',
                                  showAnnouncementBar: true,
                                  showPromotionalBanners: true,
                                  promoRibbonText: '',
                                }),
                                showAnnouncementBar: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 accent-cyan-400"
                        />
                      </label>

                      <label className="p-4 rounded-2xl bg-slate-900/85 border border-white/10 flex items-center justify-between gap-3 cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-white">
                            Show Homepage Promotional Banners
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Display active promotional and event highlight banners below the Hero section
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={draftConfig.customization?.showPromotionalBanners ?? true}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              customization: {
                                ...(prev.customization || {
                                  defaultTheme: 'dark',
                                  accentPreset: 'cyan-emerald',
                                  showAnnouncementBar: true,
                                  showPromotionalBanners: true,
                                  promoRibbonText: '',
                                }),
                                showPromotionalBanners: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 accent-cyan-400"
                        />
                      </label>
                    </div>

                    {/* Homepage Sections Quick Customization */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">
                          Homepage Section Visibility & Ordering
                        </h3>
                        <button
                          onClick={() => {
                            setPreviewDraftMode(true);
                            onNavigate('home');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview Changes on Live Website</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {draftConfig.homepage.sections.map((sec) => (
                          <div
                            key={sec.id}
                            className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between"
                          >
                            <span className="text-xs font-semibold text-white">{sec.label}</span>
                            <button
                              onClick={() => handleSectionToggle(sec.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                                sec.visible
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border border-white/10'
                              }`}
                            >
                              {sec.visible ? 'Visible' : 'Hidden'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MODULE G: EVENT MANAGER */}
              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white">Event Manager</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Create events, upload event posters, add dates & descriptions, and publish upcoming SkillConnect events.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Event Title *
                        </label>
                        <input
                          type="text"
                          value={editingEvent.title || ''}
                          onChange={(e) =>
                            setEditingEvent((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g. SkillConnect India Pre-Launch Townhall"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Event Date *
                        </label>
                        <input
                          type="date"
                          value={editingEvent.eventDate || ''}
                          onChange={(e) =>
                            setEditingEvent((prev) => ({ ...prev, eventDate: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Location / Format
                        </label>
                        <input
                          type="text"
                          value={editingEvent.location || ''}
                          onChange={(e) =>
                            setEditingEvent((prev) => ({ ...prev, location: e.target.value }))
                          }
                          placeholder="e.g. Live Stream / New Delhi / Pan-India"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Registration / Details Link (Optional)
                        </label>
                        <input
                          type="text"
                          value={editingEvent.registrationLink || ''}
                          onChange={(e) =>
                            setEditingEvent((prev) => ({
                              ...prev,
                              registrationLink: e.target.value,
                            }))
                          }
                          placeholder="https://..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Event Description *
                        </label>
                        <textarea
                          rows={3}
                          value={editingEvent.description || ''}
                          onChange={(e) =>
                            setEditingEvent((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Describe the agenda, speakers, and how community members can participate..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-xs font-semibold text-slate-300">
                          Event Poster Image (URL or Upload)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            type="text"
                            value={editingEvent.posterUrl || ''}
                            onChange={(e) =>
                              setEditingEvent((prev) => ({ ...prev, posterUrl: e.target.value }))
                            }
                            placeholder="Poster URL or click Upload Poster..."
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                          />
                          <label className="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {busyAction === 'upload-event_poster'
                                ? 'Uploading...'
                                : 'Upload Event Poster'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadFile(file, 'event_poster', (url) =>
                                    setEditingEvent((prev) => ({ ...prev, posterUrl: url }))
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Event Status
                        </label>
                        <select
                          value={editingEvent.status || 'published'}
                          onChange={(e) =>
                            setEditingEvent((prev) => ({
                              ...prev,
                              status: e.target.value as 'draft' | 'published',
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (
                          !editingEvent.title?.trim() ||
                          !editingEvent.description?.trim() ||
                          !editingEvent.eventDate?.trim()
                        ) {
                          notify('error', 'Please fill in Event Title, Date, and Description.');
                          return;
                        }
                        await saveCMSEvent(
                          {
                            id: editingEvent.id || '',
                            title: editingEvent.title.trim(),
                            description: editingEvent.description.trim(),
                            posterUrl: editingEvent.posterUrl || '',
                            eventDate: editingEvent.eventDate,
                            location: editingEvent.location || 'India',
                            registrationLink: editingEvent.registrationLink || '',
                            status: editingEvent.status || 'published',
                          },
                          founderEmail
                        );
                        setEditingEvent({
                          title: '',
                          description: '',
                          posterUrl: '',
                          eventDate: '2026-11-08',
                          location: 'Online / Pan-India',
                          registrationLink: '',
                          status: 'published',
                        });
                        await refreshFounderCollections();
                        notify('success', 'Event saved.');
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingEvent.id ? 'Update Event' : 'Save Event'}</span>
                    </button>
                  </div>

                  {/* Existing Events */}
                  <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
                    <h3 className="text-sm font-bold text-white">
                      Upcoming & Draft Events ({allEvents.length})
                    </h3>
                    {allEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          {ev.posterUrl && (
                            <img
                              src={ev.posterUrl}
                              alt={ev.title}
                              className="w-16 h-12 rounded-lg object-cover border border-white/10"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{ev.title}</span>
                              <span className="text-[10px] font-mono text-cyan-400">
                                {ev.eventDate}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                  ev.status === 'published'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {ev.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1">{ev.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingEvent(ev)}
                            className="p-2 rounded-lg glass-panel text-cyan-300 hover:text-white cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                title: 'Delete Event',
                                message: `Are you sure you want to delete event "${ev.title}"?`,
                                onConfirm: async () => {
                                  await deleteCMSEvent(ev.id, ev.title, founderEmail);
                                  await refreshFounderCollections();
                                  notify('info', 'Event deleted.');
                                },
                              })
                            }
                            className="p-2 rounded-lg glass-panel text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* MODULE H: MEDIA MANAGER */}
              {activeTab === 'media' && (
                <motion.div
                  key="media"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">Media Manager</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Upload promotional graphics to Firebase Storage, preview images before publishing, and safely remove unused media.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <select
                          value={mediaCategory}
                          onChange={(e) => setMediaCategory(e.target.value as any)}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                        >
                          <option value="banner">Banner Graphic</option>
                          <option value="event_poster">Event Poster</option>
                          <option value="seo_social">SEO Share Image</option>
                          <option value="general">General Media</option>
                        </select>

                        <label className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center gap-2 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {busyAction?.startsWith('upload-') ? 'Uploading...' : 'Upload Image'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadFile(file, mediaCategory);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Media Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {mediaAssets.length === 0 ? (
                      <div className="sm:col-span-3 glass-card rounded-2xl p-8 text-center text-xs text-slate-400">
                        No media uploaded yet. Upload images above to manage promotional graphics.
                      </div>
                    ) : (
                      mediaAssets.map((item) => {
                        const usages = isMediaAssetInUse(item.url);
                        return (
                          <div
                            key={item.id}
                            className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
                          >
                            <div>
                              <div
                                onClick={() => setPreviewMediaItem(item)}
                                className="h-44 bg-slate-950 relative overflow-hidden cursor-pointer group"
                              >
                                <img
                                  src={item.url}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-semibold text-white gap-1">
                                  <Eye className="w-4 h-4 text-cyan-400" />
                                  <span>Preview Full Image</span>
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="text-xs font-bold text-white truncate">
                                  {item.title}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                                  <span className="uppercase">{item.category}</span>
                                  <span>{Math.round((item.sizeBytes || 0) / 1024)} KB</span>
                                </div>
                                {usages.length > 0 ? (
                                  <div className="mt-2 px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300">
                                    In use ({usages.length}): {usages[0]}
                                  </div>
                                ) : (
                                  <div className="mt-2 px-2 py-1 rounded bg-white/5 text-[10px] text-slate-400">
                                    Unused — Safe to remove
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="px-4 pb-4 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.url);
                                  setCopiedMediaId(item.id);
                                  setTimeout(() => setCopiedMediaId(null), 2000);
                                }}
                                className="flex-1 py-1.5 px-2.5 rounded-lg glass-panel text-[11px] text-cyan-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {copiedMediaId === item.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy URL</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  if (usages.length > 0) {
                                    notify(
                                      'error',
                                      `Cannot delete "${item.title}" while it is actively used in: ${usages.join(
                                        ', '
                                      )}.`
                                    );
                                    return;
                                  }
                                  setConfirmDelete({
                                    title: 'Delete Unused Media Asset',
                                    message: `Permanently remove "${item.title}" from Media Manager?`,
                                    onConfirm: async () => {
                                      await deleteCMSMediaAsset(item, founderEmail);
                                      await refreshFounderCollections();
                                      notify('info', `Removed media "${item.title}".`);
                                    },
                                  });
                                }}
                                className="p-1.5 rounded-lg glass-panel text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                                title="Safely Remove Unused Media"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {/* MODULE I: SEO MANAGER */}
              {activeTab === 'seo' && (
                <motion.div
                  key="seo"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        SEO & Social Sharing Manager
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Edit page titles, meta descriptions, and social sharing images while preserving canonical URLs, JSON-LD schema, robots.txt, and sitemap.xml.
                      </p>
                    </div>

                    {/* Page Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Select Page to Edit SEO Metadata
                        </label>
                        <select
                          value={selectedSeoPage}
                          onChange={(e) => setSelectedSeoPage(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                        >
                          {Object.keys(draftConfig.seo.pages).map((pageKey) => (
                            <option key={pageKey} value={pageKey}>
                              Page: {pageKey.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Official Canonical Homepage URL
                        </label>
                        <input
                          type="url"
                          value={draftConfig.seo.canonicalUrl}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              seo: { ...prev.seo, canonicalUrl: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Selected Page Title & Meta Description */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <div>
                        <label className="block text-xs font-semibold text-cyan-300 mb-1">
                          SEO Title for [{selectedSeoPage.toUpperCase()}]
                        </label>
                        <input
                          type="text"
                          value={draftConfig.seo.pages[selectedSeoPage]?.title || ''}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              seo: {
                                ...prev.seo,
                                pages: {
                                  ...prev.seo.pages,
                                  [selectedSeoPage]: {
                                    ...(prev.seo.pages[selectedSeoPage] || {
                                      title: '',
                                      description: '',
                                    }),
                                    title: e.target.value,
                                  },
                                },
                              },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-cyan-300 mb-1">
                          Meta Description for [{selectedSeoPage.toUpperCase()}]
                        </label>
                        <textarea
                          rows={3}
                          value={draftConfig.seo.pages[selectedSeoPage]?.description || ''}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              seo: {
                                ...prev.seo,
                                pages: {
                                  ...prev.seo.pages,
                                  [selectedSeoPage]: {
                                    ...(prev.seo.pages[selectedSeoPage] || {
                                      title: '',
                                      description: '',
                                    }),
                                    description: e.target.value,
                                  },
                                },
                              },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Social Sharing Images */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          OpenGraph Social Share Image URL (og:image)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={draftConfig.seo.ogImageUrl}
                            onChange={(e) =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                seo: { ...prev.seo, ogImageUrl: e.target.value },
                              }))
                            }
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                          />
                          <label className="px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold cursor-pointer flex items-center">
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadFile(file, 'seo_social', (url) =>
                                    setDraftConfig((prev) => ({
                                      ...prev,
                                      seo: {
                                        ...prev.seo,
                                        ogImageUrl: url,
                                        twitterImageUrl: url,
                                      },
                                    }))
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Global SEO Keywords
                        </label>
                        <input
                          type="text"
                          value={draftConfig.seo.keywords}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              seo: { ...prev.seo, keywords: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Google Search Result Snippet Preview */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Google Search Snippet Live Preview
                      </div>
                      <div className="text-xs text-emerald-400 truncate">
                        {draftConfig.seo.canonicalUrl.replace(/\/+$/, '')}
                        {selectedSeoPage !== 'home' ? `/${selectedSeoPage}` : '/'}
                      </div>
                      <div className="text-sm font-bold text-blue-400">
                        {draftConfig.seo.pages[selectedSeoPage]?.title}
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {draftConfig.seo.pages[selectedSeoPage]?.description}
                      </p>
                    </div>

                    {/* Dynamic Sitemap.xml Generator Preview */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/20 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                            <span>
                              Dynamic Sitemap.xml Generator ({PUBLIC_SITEMAP_ROUTES.length} Public Canonical Routes)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Automatically populates <code className="text-cyan-300">&lt;lastmod&gt;</code> ({formatSitemapLastMod(draftConfig.updatedAt)}) across all public routes for optimal Googlebot indexing frequency.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const xml = generateSitemapXml({
                              baseUrl: draftConfig.seo.canonicalUrl,
                              defaultLastMod: draftConfig.updatedAt || Date.now(),
                            });
                            navigator.clipboard.writeText(xml);
                            setStatusBanner({
                              type: 'success',
                              text: 'Dynamic sitemap.xml copied to clipboard.',
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy sitemap.xml</span>
                        </button>
                      </div>
                      <pre className="max-h-44 overflow-y-auto rounded-xl bg-black/70 border border-white/5 p-3 text-[11px] font-mono text-slate-300 leading-relaxed">
                        {generateSitemapXml({
                          baseUrl: draftConfig.seo.canonicalUrl,
                          defaultLastMod: draftConfig.updatedAt || Date.now(),
                        })}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MODULE J: REVISION RESTORE & AUDIT LOG */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  {/* Version Restore */}
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Version History & Safe Content Restore
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Restore any previously published snapshot with one click.
                      </p>
                    </div>

                    {revisions.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        No published revisions recorded yet. Click "Publish Live" to create your first version snapshot.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {revisions.map((rev: CMSRevisionItem) => (
                          <div
                            key={rev.id}
                            className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="text-xs font-bold text-white">{rev.label}</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                By {rev.authorEmail}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  title: 'Restore Previous Website Version',
                                  message: `Restore the live website and draft to revision "${rev.label}"?`,
                                  onConfirm: async () => {
                                    await restoreSiteRevision(
                                      rev.snapshotData,
                                      rev.label,
                                      founderEmail
                                    );
                                    await refreshFounderCollections();
                                    notify(
                                      'success',
                                      `Restored website to revision: ${rev.label}`
                                    );
                                  },
                                })
                              }
                              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-cyan-500/30"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore This Version</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Immutable Audit Log */}
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                    <h3 className="text-base font-bold text-white">
                      Security & Publishing Audit Log ({auditLogs.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-slate-900/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-bold text-cyan-300">[{log.module}]</span>{' '}
                            <strong className="text-white">{log.action}:</strong>{' '}
                            <span className="text-slate-300">{log.summary}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {log.actorEmail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Animated User Profile Inspection Modal */}
      <AnimatePresence>
        {selectedUserProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedUserProfile(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/35 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                    {selectedUserProfile.role} Profile
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">
                    {selectedUserProfile.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedUserProfile(null)}
                  className="p-1.5 rounded-lg glass-panel text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/85 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Email</div>
                  <div className="text-white font-medium mt-0.5 break-all">
                    {selectedUserProfile.email}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/85 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">
                    Phone / Channel
                  </div>
                  <div className="text-white font-medium mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-400" />
                    <span>{selectedUserProfile.phone}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/85 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">
                    Skill Category / Subject
                  </div>
                  <div className="text-cyan-300 font-semibold mt-0.5">
                    {selectedUserProfile.categoryOrSubject}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/85 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Location</div>
                  <div className="text-white font-medium mt-0.5">
                    {selectedUserProfile.location}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1.5 text-xs">
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Profile Bio / Submission Details
                </div>
                <p className="text-slate-200 leading-relaxed">{selectedUserProfile.bioOrDetails}</p>
                {typeof selectedUserProfile.experienceYears === 'number' &&
                  selectedUserProfile.experienceYears > 0 && (
                    <div className="pt-2 text-emerald-300 font-mono text-[11px]">
                      Experience: {selectedUserProfile.experienceYears} Years
                    </div>
                  )}
              </div>

              {selectedUserProfile.sourceCollection !== 'users' && (
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleUserStatusAction(selectedUserProfile, 'activate')}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Activate / Verify Account</span>
                  </button>
                  <button
                    onClick={() => handleUserStatusAction(selectedUserProfile, 'suspend')}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Suspend Account</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal before Deleting or Restoring Content */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="max-w-md w-full glass-card rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold text-white">{confirmDelete.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{confirmDelete.message}</p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const fn = confirmDelete.onConfirm;
                    setConfirmDelete(null);
                    await fn();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Full-Screen Preview Modal */}
      <AnimatePresence>
        {previewMediaItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setPreviewMediaItem(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="max-w-3xl w-full glass-card rounded-3xl overflow-hidden border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{previewMediaItem.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">
                    Category: {previewMediaItem.category}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewMediaItem(null)}
                  className="p-1.5 rounded-lg glass-panel text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
                <img
                  src={previewMediaItem.url}
                  alt={previewMediaItem.title}
                  className="max-w-full max-h-[62vh] object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

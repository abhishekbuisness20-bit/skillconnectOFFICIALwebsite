import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signOut, User } from 'firebase/auth';
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  AUTHORIZED_FOUNDER_ID,
  signInFounderWithIdAndPassword,
  onIdTokenChanged,
} from '../lib/firebase';
import {
  DEFAULT_CMS_SITE_CONFIG,
  verifyFounderAuthorization,
  recordCMSAuditLog,
  recordWebsitePageView,
  fetchWebsiteTrafficAnalytics,
} from '../services/cmsService';
import { resolveViewFromLocation } from '../utils/seoRouting';
import {
  CMSSiteConfigData,
  CMSBannerItem,
  CMSAnnouncementItem,
  CMSEventItem,
  CMSMediaAssetItem,
  CMSRevisionItem,
  CMSAuditLogItem,
} from '../types';

interface CMSContextValue {
  user: User | null;
  founderUserId: string;
  isFounderAuthorized: boolean;
  authChecking: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInAsFounder: (founderId: string, password: string) => Promise<boolean>;
  signOutFounder: () => Promise<void>;
  activeConfig: CMSSiteConfigData;
  publishedConfig: CMSSiteConfigData;
  draftConfig: CMSSiteConfigData;
  setDraftConfig: React.Dispatch<React.SetStateAction<CMSSiteConfigData>>;
  previewDraftMode: boolean;
  setPreviewDraftMode: (enabled: boolean) => void;
  publicBanners: CMSBannerItem[];
  publicAnnouncements: CMSAnnouncementItem[];
  publicEvents: CMSEventItem[];
  allBanners: CMSBannerItem[];
  allAnnouncements: CMSAnnouncementItem[];
  allEvents: CMSEventItem[];
  mediaAssets: CMSMediaAssetItem[];
  revisions: CMSRevisionItem[];
  auditLogs: CMSAuditLogItem[];
  communitySubmissions: Array<Record<string, any>>;
  contactInquiries: Array<Record<string, any>>;
  serviceProviders: Array<Record<string, any>>;
  activityReports: Array<Record<string, any>>;
  registeredAuthUsers: Array<Record<string, any>>;
  siteTrafficAnalytics: {
    totalPageViews: number;
    uniqueSessions: number;
    lastPath?: string;
  };
  refreshFounderCollections: () => Promise<void>;
}

const CMSContext = createContext<CMSContextValue | undefined>(undefined);

function mergeWithDefaultConfig(incoming?: Partial<CMSSiteConfigData> | null): CMSSiteConfigData {
  if (!incoming) return DEFAULT_CMS_SITE_CONFIG;
  return {
    status: incoming.status || 'published',
    homepage: {
      ...DEFAULT_CMS_SITE_CONFIG.homepage,
      ...(incoming.homepage || {}),
      sections:
        Array.isArray(incoming.homepage?.sections) && incoming.homepage!.sections.length > 0
          ? incoming.homepage!.sections
          : DEFAULT_CMS_SITE_CONFIG.homepage.sections,
    },
    about: {
      ...DEFAULT_CMS_SITE_CONFIG.about,
      ...(incoming.about || {}),
      pillars:
        Array.isArray(incoming.about?.pillars) && incoming.about!.pillars.length > 0
          ? incoming.about!.pillars
          : DEFAULT_CMS_SITE_CONFIG.about.pillars,
    },
    contact: {
      ...DEFAULT_CMS_SITE_CONFIG.contact,
      ...(incoming.contact || {}),
    },
    seo: {
      ...DEFAULT_CMS_SITE_CONFIG.seo,
      ...(incoming.seo || {}),
      pages: {
        ...DEFAULT_CMS_SITE_CONFIG.seo.pages,
        ...(incoming.seo?.pages || {}),
      },
    },
    services:
      Array.isArray(incoming.services) && incoming.services.length > 0
        ? incoming.services
        : DEFAULT_CMS_SITE_CONFIG.services,
    testimonials:
      Array.isArray(incoming.testimonials) && incoming.testimonials.length > 0
        ? incoming.testimonials
        : DEFAULT_CMS_SITE_CONFIG.testimonials,
    faqs:
      Array.isArray(incoming.faqs) && incoming.faqs.length > 0
        ? incoming.faqs
        : DEFAULT_CMS_SITE_CONFIG.faqs,
    customization: {
      ...DEFAULT_CMS_SITE_CONFIG.customization!,
      ...(incoming.customization || {}),
    },
    updatedBy: incoming.updatedBy || DEFAULT_CMS_SITE_CONFIG.updatedBy,
    updatedAt: incoming.updatedAt,
  };
}

function formatFounderAuthError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: string }).code);
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        return 'Invalid Founder User ID or Password. Please verify your credentials and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts detected. Access is temporarily locked for security. Please wait a few minutes and try again.';
      case 'auth/user-token-expired':
      case 'auth/requires-recent-login':
        return 'Your Founder session has expired. Please log in again.';
      case 'auth/network-request-failed':
        return 'Network connection error while contacting Firebase Authentication. Please check your internet connection.';
      default:
        break;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Authentication failed. Please verify your Founder User ID and Password.';
}

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isFounderAuthorized, setIsFounderAuthorized] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [publishedConfig, setPublishedConfig] = useState<CMSSiteConfigData>(DEFAULT_CMS_SITE_CONFIG);
  const [draftConfig, setDraftConfig] = useState<CMSSiteConfigData>(DEFAULT_CMS_SITE_CONFIG);
  const [previewDraftMode, setPreviewDraftMode] = useState(false);

  const [publicBanners, setPublicBanners] = useState<CMSBannerItem[]>([]);
  const [publicAnnouncements, setPublicAnnouncements] = useState<CMSAnnouncementItem[]>([]);
  const [publicEvents, setPublicEvents] = useState<CMSEventItem[]>([]);

  const [allBanners, setAllBanners] = useState<CMSBannerItem[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<CMSAnnouncementItem[]>([]);
  const [allEvents, setAllEvents] = useState<CMSEventItem[]>([]);
  const [mediaAssets, setMediaAssets] = useState<CMSMediaAssetItem[]>([]);
  const [revisions, setRevisions] = useState<CMSRevisionItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<CMSAuditLogItem[]>([]);
  const [communitySubmissions, setCommunitySubmissions] = useState<Array<Record<string, any>>>([]);
  const [contactInquiries, setContactInquiries] = useState<Array<Record<string, any>>>([]);
  const [serviceProviders, setServiceProviders] = useState<Array<Record<string, any>>>([]);
  const [activityReports, setActivityReports] = useState<Array<Record<string, any>>>([]);
  const [registeredAuthUsers, setRegisteredAuthUsers] = useState<Array<Record<string, any>>>([]);
  const [siteTrafficAnalytics, setSiteTrafficAnalytics] = useState<{
    totalPageViews: number;
    uniqueSessions: number;
    lastPath?: string;
  }>({ totalPageViews: 1, uniqueSessions: 1, lastPath: 'home' });

  // Subscribe to public published site_published config and public collections
  useEffect(() => {
    recordWebsitePageView(
      typeof window !== 'undefined'
        ? resolveViewFromLocation()
        : 'home'
    );

    const unsubConfig = onSnapshot(
      doc(db, 'cms_config', 'site_published'),
      (snap) => {
        if (snap.exists()) {
          const merged = mergeWithDefaultConfig(snap.data() as Partial<CMSSiteConfigData>);
          setPublishedConfig(merged);
        } else {
          setPublishedConfig(DEFAULT_CMS_SITE_CONFIG);
        }
      },
      () => {
        // Fallback silently to default config if offline
      }
    );

    const unsubBanners = onSnapshot(
      query(collection(db, 'cms_banners'), where('status', '==', 'published')),
      (snap) => {
        const items: CMSBannerItem[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<CMSBannerItem, 'id'>) }));
        setPublicBanners(items);
      },
      () => {}
    );

    const unsubAnnouncements = onSnapshot(
      query(collection(db, 'cms_announcements'), where('status', '==', 'published')),
      (snap) => {
        const items: CMSAnnouncementItem[] = [];
        snap.forEach((d) =>
          items.push({ id: d.id, ...(d.data() as Omit<CMSAnnouncementItem, 'id'>) })
        );
        setPublicAnnouncements(items);
      },
      () => {}
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'cms_events'), where('status', '==', 'published')),
      (snap) => {
        const items: CMSEventItem[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<CMSEventItem, 'id'>) }));
        setPublicEvents(items);
      },
      () => {}
    );

    return () => {
      unsubConfig();
      unsubBanners();
      unsubAnnouncements();
      unsubEvents();
    };
  }, []);

  const refreshFounderCollections = useCallback(async () => {
    if (!isFounderAuthorized) return;

    try {
      const draftSnap = await getDoc(doc(db, 'cms_config', 'site_draft'));
      if (draftSnap.exists()) {
        setDraftConfig(mergeWithDefaultConfig(draftSnap.data() as Partial<CMSSiteConfigData>));
      } else {
        const pubSnap = await getDoc(doc(db, 'cms_config', 'site_published'));
        if (pubSnap.exists()) {
          setDraftConfig(mergeWithDefaultConfig(pubSnap.data() as Partial<CMSSiteConfigData>));
        } else {
          setDraftConfig(DEFAULT_CMS_SITE_CONFIG);
        }
      }
    } catch {
      // Keep current draftConfig
    }

    try {
      const bSnap = await getDocs(collection(db, 'cms_banners'));
      const bList: CMSBannerItem[] = [];
      bSnap.forEach((d) => bList.push({ id: d.id, ...(d.data() as Omit<CMSBannerItem, 'id'>) }));
      setAllBanners(bList);
    } catch {}

    try {
      const aSnap = await getDocs(collection(db, 'cms_announcements'));
      const aList: CMSAnnouncementItem[] = [];
      aSnap.forEach((d) =>
        aList.push({ id: d.id, ...(d.data() as Omit<CMSAnnouncementItem, 'id'>) })
      );
      setAllAnnouncements(aList);
    } catch {}

    try {
      const eSnap = await getDocs(collection(db, 'cms_events'));
      const eList: CMSEventItem[] = [];
      eSnap.forEach((d) => eList.push({ id: d.id, ...(d.data() as Omit<CMSEventItem, 'id'>) }));
      setAllEvents(eList);
    } catch {}

    try {
      const mSnap = await getDocs(collection(db, 'cms_media'));
      const mList: CMSMediaAssetItem[] = [];
      mSnap.forEach((d) =>
        mList.push({ id: d.id, ...(d.data() as Omit<CMSMediaAssetItem, 'id'>) })
      );
      setMediaAssets(mList);
    } catch {}

    try {
      const rSnap = await getDocs(collection(db, 'cms_revisions'));
      const rList: CMSRevisionItem[] = [];
      rSnap.forEach((d) =>
        rList.push({ id: d.id, ...(d.data() as Omit<CMSRevisionItem, 'id'>) })
      );
      setRevisions(rList);
    } catch {}

    try {
      const lSnap = await getDocs(collection(db, 'cms_audit_logs'));
      const lList: CMSAuditLogItem[] = [];
      lSnap.forEach((d) =>
        lList.push({ id: d.id, ...(d.data() as Omit<CMSAuditLogItem, 'id'>) })
      );
      setAuditLogs(lList);
    } catch {}

    try {
      const fSnap = await getDocs(collection(db, 'community_feedback'));
      const fList: Array<Record<string, any>> = [];
      fSnap.forEach((d) => fList.push({ id: d.id, ...d.data() }));
      setCommunitySubmissions(fList);
    } catch {}

    try {
      const iSnap = await getDocs(collection(db, 'contact_inquiries'));
      const iList: Array<Record<string, any>> = [];
      iSnap.forEach((d) => iList.push({ id: d.id, ...d.data() }));
      setContactInquiries(iList);
    } catch {}

    try {
      const pSnap = await getDocs(collection(db, 'service_providers'));
      const pList: Array<Record<string, any>> = [];
      pSnap.forEach((d) => pList.push({ id: d.id, ...d.data() }));
      setServiceProviders(pList);
    } catch {}

    try {
      const arSnap = await getDocs(collection(db, 'activity_reports'));
      const arList: Array<Record<string, any>> = [];
      arSnap.forEach((d) => arList.push({ id: d.id, ...d.data() }));
      setActivityReports(arList);
    } catch {}

    try {
      const uSnap = await getDocs(collection(db, 'users'));
      const uList: Array<Record<string, any>> = [];
      uSnap.forEach((d) => uList.push({ id: d.id, ...d.data() }));
      setRegisteredAuthUsers(uList);
    } catch {}

    try {
      const traffic = await fetchWebsiteTrafficAnalytics();
      setSiteTrafficAnalytics(traffic);
    } catch {}
  }, [isFounderAuthorized]);

  // Monitor Firebase Auth state & token lifecycle, verifying Founder authorization on backend
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsFounderAuthorized(false);
        setPreviewDraftMode(false);
        setAuthChecking(false);
        return;
      }

      setAuthChecking(true);
      const result = await verifyFounderAuthorization(currentUser);
      if (result.authorized) {
        setIsFounderAuthorized(true);
        setAuthError(null);
      } else {
        setIsFounderAuthorized(false);
        setPreviewDraftMode(false);
        setAuthError(result.reason || 'Unauthorized account.');
        await signOut(auth).catch(() => {});
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isFounderAuthorized) {
      refreshFounderCollections();
    }
  }, [isFounderAuthorized, refreshFounderCollections]);

  const signInAsFounder = async (founderId: string, password: string): Promise<boolean> => {
    setAuthError(null);
    setAuthChecking(true);
    try {
      const authenticatedUser = await signInFounderWithIdAndPassword(founderId, password);

      const verification = await verifyFounderAuthorization(authenticatedUser);
      if (!verification.authorized) {
        await signOut(auth);
        setIsFounderAuthorized(false);
        setAuthError(
          verification.reason ||
            'Access Denied: Only the authorized Founder account can access the SkillConnect CMS.'
        );
        setAuthChecking(false);
        return false;
      }

      setIsFounderAuthorized(true);
      try {
        await recordCMSAuditLog(
          'Founder Login',
          'Authentication',
          `Verified Founder login by User ID ${AUTHORIZED_FOUNDER_ID}`,
          AUTHORIZED_FOUNDER_ID
        );
      } catch {}
      setAuthChecking(false);
      return true;
    } catch (error) {
      const msg = formatFounderAuthError(error);
      setAuthError(msg);
      setAuthChecking(false);
      return false;
    }
  };

  const signOutFounder = async (): Promise<void> => {
    if (user && isFounderAuthorized) {
      try {
        await recordCMSAuditLog(
          'Founder Logout',
          'Authentication',
          `Founder session signed out (${AUTHORIZED_FOUNDER_ID})`,
          AUTHORIZED_FOUNDER_ID
        );
      } catch {}
    }
    setPreviewDraftMode(false);
    setIsFounderAuthorized(false);
    await signOut(auth);
  };

  const activeConfig =
    isFounderAuthorized && previewDraftMode ? draftConfig : publishedConfig;

  return (
    <CMSContext.Provider
      value={{
        user,
        founderUserId: AUTHORIZED_FOUNDER_ID,
        isFounderAuthorized,
        authChecking,
        authError,
        clearAuthError: () => setAuthError(null),
        signInAsFounder,
        signOutFounder,
        activeConfig,
        publishedConfig,
        draftConfig,
        setDraftConfig,
        previewDraftMode,
        setPreviewDraftMode,
        publicBanners: isFounderAuthorized && previewDraftMode ? allBanners : publicBanners,
        publicAnnouncements:
          isFounderAuthorized && previewDraftMode ? allAnnouncements : publicAnnouncements,
        publicEvents: isFounderAuthorized && previewDraftMode ? allEvents : publicEvents,
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
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export function useCMS(): CMSContextValue {
  const ctx = useContext(CMSContext);
  if (!ctx) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return ctx;
}

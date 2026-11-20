import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { User } from 'firebase/auth';
import {
  db,
  storage,
  AUTHORIZED_FOUNDER_FIREBASE_EMAIL,
  AUTHORIZED_FOUNDER_UID,
} from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { BRAND_CONFIG, VERIFIED_FEATURES } from '../data/websiteContent';
import { COMMUNITY_TESTIMONIALS } from '../data/testimonialsData';
import {
  CMSSiteConfigData,
  CMSBannerItem,
  CMSAnnouncementItem,
  CMSEventItem,
  CMSMediaAssetItem,
} from '../types';

export function generateCMSId(prefix: string): string {
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16);
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 9);
  return `${cleanPrefix}_${ts}_${rand}`;
}

export const DEFAULT_CMS_SITE_CONFIG: CMSSiteConfigData = {
  status: 'published',
  homepage: {
    tagline: BRAND_CONFIG.tagline,
    mainHeadingLine1: 'Discover Skills.',
    mainHeadingHighlight: 'Connect Opportunities.',
    description: BRAND_CONFIG.description,
    launchDateString: BRAND_CONFIG.launchDateString,
    sections: [
      { id: 'about', label: 'About Us & Leadership', visible: true, order: 1 },
      { id: 'features', label: 'Verified Services & Features', visible: true, order: 2 },
      { id: 'showcase', label: 'Mobile App Showcase', visible: true, order: 3 },
      { id: 'events', label: 'Upcoming Platform Events', visible: true, order: 4 },
      { id: 'feedback', label: 'Community Feedback & Testimonials', visible: true, order: 5 },
      { id: 'launch', label: 'Launch Milestone & Schedule', visible: true, order: 6 },
      { id: 'contact', label: 'Contact Founder & Inquiries', visible: true, order: 7 },
    ],
  },
  about: {
    kicker: 'Origins & Architecture',
    heading: 'About SkillConnect Official & Leadership Team',
    introParagraph:
      'SkillConnect Official is an independent Indian skill-based services marketplace conceived and engineered by Abhishek Singh. Our mission is to bridge the persistent gap between customers, skilled service providers, independent professionals, and companies across India seeking genuine, verified capability.',
    founderQuote1:
      'Modern platforms often prioritize unverified claims over demonstrated competence. I founded SkillConnect with a single guiding mission: to create a transparent digital ecosystem where skills speak for themselves.',
    founderQuote2:
      'Whether you are an aspiring programmer exchanging insights with a peer, a skilled service provider seeking direct client projects, or a company looking for trusted talent across India, SkillConnect puts authentic learning and collaboration at the center.',
    pillars: [
      {
        title: 'Authentic Skill Proof',
        description:
          'We reject self-assessed vanity checklists. SkillConnect links project code, design prototypes, and verified milestones to demonstrate real-world competence.',
      },
      {
        title: 'Mutual Peer Barter',
        description:
          'Knowledge should not be restricted by financial limits. Our peer exchange protocol allows practitioners to exchange their expertise on equal footing.',
      },
      {
        title: 'Pure Engineering Quality',
        description:
          'Built from the ground up with high performance, strict privacy guarantees, and verifiable identity encryption. Every line is tuned for reliability.',
      },
      {
        title: 'Zero Fake Data Policy',
        description:
          'We state our exact roadmap truthfully. We never invent partner logos, fabricated testimonials, or premature download claims prior to 8 November 2026.',
      },
    ],
  },
  contact: {
    founderName: BRAND_CONFIG.founder,
    founderRole: BRAND_CONFIG.founderRole,
    founderEmail: BRAND_CONFIG.founderEmail,
    founderInstagramUrl: BRAND_CONFIG.founderInstagramUrl,
    founderInstagramHandle: BRAND_CONFIG.founderInstagramHandle,
    platformInstagramUrl: BRAND_CONFIG.instagramUrl,
    playStoreUrl: BRAND_CONFIG.playStoreUrl,
    contactHeading: 'Contact SkillConnect & Founder',
    contactSubtitle:
      'Have a question regarding our upcoming November 8, 2026 launch, want to discuss service provider partnerships across India, or explore early mentorship collaboration? Connect directly with Abhishek Singh.',
    responseSla: 'Typically within 24 to 48 business hours.',
  },
  seo: {
    canonicalUrl: 'https://skillconnectofficial.cloud.run/',
    keywords:
      'SkillConnect Official, SkillConnect, SkillConnect India, SkillConnect Official India, Abhishek Singh, skill-based services marketplace India, verified professionals India, skill barter India, freelance services marketplace India',
    ogImageUrl:
      'https://skillconnectofficial.cloud.run/assets/aistudio/WhatsApp_Image_2026-10-30_at_7.22.18_PM_0b89498a.jpeg',
    twitterImageUrl:
      'https://skillconnectofficial.cloud.run/assets/aistudio/WhatsApp_Image_2026-10-30_at_7.22.18_PM_0b89498a.jpeg',
    pages: {
      home: {
        title: 'SkillConnect Official – Skill Services Marketplace India',
        description:
          'SkillConnect Official connects customers, verified service providers, and companies across India for skill exchange, mentorship, and freelance services.',
      },
      about: {
        title: 'About SkillConnect Official – Founder Abhishek Singh',
        description:
          'Learn about SkillConnect Official, founded by Abhishek Singh. An independent Indian skill-services marketplace built for verified talent and companies.',
      },
      features: {
        title: 'Verified Services & Features – SkillConnect Official India',
        description:
          'Explore verified SkillConnect Official features: mentorship, peer skill barter, geo-matching, verified portfolios, and freelance talent across India.',
      },
      showcase: {
        title: 'Mobile App Showcase – SkillConnect Official Android App',
        description:
          'Preview the SkillConnect Official Android app interface designed for fast service matching, direct mentorship chat, and verified skill portfolios in India.',
      },
      launch: {
        title: 'SkillConnect Launch 8 Nov 2026 – Android App Release Info',
        description:
          'Track the official SkillConnect Official November 8, 2026 release roadmap, Google Play Store launch updates, and security notices by Abhishek Singh.',
      },
      feedback: {
        title: 'Community Feedback & Beta Reviews – SkillConnect Official',
        description:
          'Read authentic pre-launch reviews from verified contractors, developers, educators, and beta testers across India evaluating SkillConnect Official.',
      },
      contact: {
        title: 'Contact SkillConnect Official – Direct Founder Inquiries',
        description:
          'Contact SkillConnect Official founder Abhishek Singh directly for service provider onboarding, platform partnerships, beta access, and support in India.',
      },
      privacy: {
        title: 'Privacy Policy – SkillConnect Official India Platform',
        description:
          'Read the SkillConnect Official Privacy Policy detailing user data protection, DPDP Act and GDPR compliance, zero data-sale rules, and transparent privacy.',
      },
      terms: {
        title: 'Terms & Conditions – SkillConnect Official Marketplace',
        description:
          'Review the Terms and Conditions governing use of the SkillConnect Official website, verified portfolios, and upcoming Android application across India.',
      },
      disclaimer: {
        title: 'Platform Disclaimer – SkillConnect Official India',
        description:
          'Official platform disclaimer for SkillConnect Official establishing independent operations, pre-launch roadmap transparency, and user due diligence terms.',
      },
      deletion: {
        title: 'Account & Data Deletion – SkillConnect Official India',
        description:
          'Submit a verified account and personal data deletion request for SkillConnect Official in compliance with GDPR Article 17 and Google Play User Data rules.',
      },
    },
  },
  services: VERIFIED_FEATURES,
  testimonials: COMMUNITY_TESTIMONIALS,
  faqs: [
    {
      id: 'faq_1',
      question: 'What is SkillConnect Official and how does it work?',
      answer:
        'SkillConnect Official is an independent Indian skill-based services marketplace founded by Abhishek Singh. It connects customers, skilled service providers, independent professionals, and companies through verified portfolios, peer mentorship, and direct skill barter.',
      category: 'General',
    },
    {
      id: 'faq_2',
      question: 'When will the SkillConnect Official Android app launch on Google Play Store?',
      answer:
        'The official public release of the SkillConnect Android application on Google Play Store is scheduled for 8 November 2026. Early service providers and beta testers can register now through our official website.',
      category: 'Security & Launch',
    },
    {
      id: 'faq_3',
      question: 'How are skilled service providers verified on SkillConnect?',
      answer:
        'Every service provider undergoes multi-step portfolio inspection, real-world skill demonstration, and identity verification before receiving a Verified Provider badge on the marketplace.',
      category: 'Providers',
    },
    {
      id: 'faq_4',
      question: 'Can professionals exchange skills without monetary fees?',
      answer:
        'Yes! Our Mutual Peer Barter protocol enables developers, designers, educators, and tradespeople to exchange verified mentorship or project hours directly on equal footing.',
      category: 'Customers',
    },
    {
      id: 'faq_5',
      question: 'Is there any official APK download outside Google Play Store?',
      answer:
        'No. For your security, SkillConnect Official never distributes third-party APK mirrors. Only trust skillconnectofficial.cloud.run and our official Google Play Store listing.',
      category: 'Security & Launch',
    },
  ],
  customization: {
    defaultTheme: 'dark',
    accentPreset: 'cyan-emerald',
    showAnnouncementBar: true,
    showPromotionalBanners: true,
    promoRibbonText: 'Official Android App Release: 8 November 2026',
  },
  updatedBy: BRAND_CONFIG.founderEmail,
};

/**
 * Verifies Founder authorization against Firebase Auth token and backend Firestore rules.
 */
export async function verifyFounderAuthorization(user: User | null): Promise<{
  authorized: boolean;
  reason?: string;
}> {
  if (!user) {
    return { authorized: false, reason: 'Not signed in.' };
  }

  try {
    // Force refresh ID token to ensure server-validated claims and check session expiry
    const tokenResult = await user.getIdTokenResult(true);
    const expTime = new Date(tokenResult.expirationTime).getTime();
    if (Number.isFinite(expTime) && expTime <= Date.now()) {
      return {
        authorized: false,
        reason: 'Your Founder session has expired. Please sign in again.',
      };
    }

    const email =
      (tokenResult.claims.email as string | undefined)?.toLowerCase() ||
      user.email?.toLowerCase() ||
      '';

    const isProvisionedFounderAccount =
      user.uid === AUTHORIZED_FOUNDER_UID &&
      email === AUTHORIZED_FOUNDER_FIREBASE_EMAIL.toLowerCase();

    const isVerifiedPrimaryEmail =
      email === BRAND_CONFIG.founderEmail.toLowerCase() &&
      Boolean(tokenResult.claims.email_verified || user.emailVerified);

    if (!isProvisionedFounderAccount && !isVerifiedPrimaryEmail) {
      try {
        const adminDoc = await getDocFromServer(doc(db, 'admins', user.uid));
        if (!adminDoc.exists()) {
          return {
            authorized: false,
            reason:
              'Unauthorized account. Access to the SkillConnect CMS is restricted to the authorized Founder account.',
          };
        }
      } catch {
        return {
          authorized: false,
          reason:
            'Unauthorized account. Access to the SkillConnect CMS is restricted to the authorized Founder account.',
        };
      }
    }

    // Perform a server-enforced read on restricted /cms_config/site_draft to confirm backend rule enforcement
    await getDocFromServer(doc(db, 'cms_config', 'site_draft'));
    return { authorized: true };
  } catch (error) {
    return {
      authorized: false,
      reason:
        error instanceof Error
          ? error.message
          : 'Backend authorization check rejected access.',
    };
  }
}

/**
 * Record an immutable audit log entry in Firestore
 */
export async function recordCMSAuditLog(
  action: string,
  moduleName: string,
  summary: string,
  actorEmail: string
): Promise<void> {
  const logId = generateCMSId('log');
  const path = `cms_audit_logs/${logId}`;
  try {
    await setDoc(doc(db, 'cms_audit_logs', logId), {
      action: action.slice(0, 80),
      module: moduleName.slice(0, 80),
      summary: summary.slice(0, 500),
      actorEmail: (actorEmail || BRAND_CONFIG.founderEmail).slice(0, 120),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Save Draft Site Config to /cms_config/site_draft
 */
export async function saveDraftSiteConfig(
  config: CMSSiteConfigData,
  actorEmail: string,
  moduleLabel = 'Website Content'
): Promise<void> {
  const path = 'cms_config/site_draft';
  try {
    const cleanPayload: CMSSiteConfigData = {
      status: 'draft',
      homepage: config.homepage,
      about: config.about,
      contact: config.contact,
      seo: config.seo,
      services: config.services.slice(0, 30),
      testimonials: config.testimonials.slice(0, 40),
      faqs: (config.faqs || DEFAULT_CMS_SITE_CONFIG.faqs || []).slice(0, 40),
      customization: config.customization || DEFAULT_CMS_SITE_CONFIG.customization,
      updatedBy: (actorEmail || BRAND_CONFIG.founderEmail).slice(0, 120),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'cms_config', 'site_draft'), cleanPayload);
    await recordCMSAuditLog(
      'Save Draft',
      moduleLabel,
      `Saved draft changes in ${moduleLabel}`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Publish Site Config to /cms_config/site_published AND create a Revision Snapshot
 */
export async function publishSiteConfig(
  config: CMSSiteConfigData,
  actorEmail: string,
  revisionLabel = 'Published live update'
): Promise<void> {
  const path = 'cms_config/site_published';
  try {
    const publishedPayload: CMSSiteConfigData = {
      status: 'published',
      homepage: config.homepage,
      about: config.about,
      contact: config.contact,
      seo: config.seo,
      services: config.services.slice(0, 30),
      testimonials: config.testimonials.slice(0, 40),
      faqs: (config.faqs || DEFAULT_CMS_SITE_CONFIG.faqs || []).slice(0, 40),
      customization: config.customization || DEFAULT_CMS_SITE_CONFIG.customization,
      updatedBy: (actorEmail || BRAND_CONFIG.founderEmail).slice(0, 120),
      updatedAt: serverTimestamp(),
    };

    // Write both site_published and sync site_draft
    await setDoc(doc(db, 'cms_config', 'site_published'), publishedPayload);
    await setDoc(doc(db, 'cms_config', 'site_draft'), {
      ...publishedPayload,
      status: 'draft',
    });

    // Save a Revision Snapshot for safe rollback
    const revId = generateCMSId('rev');
    const snapshotCopy = {
      status: 'published' as const,
      homepage: config.homepage,
      about: config.about,
      contact: config.contact,
      seo: config.seo,
      services: config.services.slice(0, 30),
      testimonials: config.testimonials.slice(0, 40),
      faqs: (config.faqs || DEFAULT_CMS_SITE_CONFIG.faqs || []).slice(0, 40),
      customization: config.customization || DEFAULT_CMS_SITE_CONFIG.customization,
      updatedBy: (actorEmail || BRAND_CONFIG.founderEmail).slice(0, 120),
    };
    await setDoc(doc(db, 'cms_revisions', revId), {
      label: revisionLabel.slice(0, 150),
      authorEmail: (actorEmail || BRAND_CONFIG.founderEmail).slice(0, 120),
      snapshotData: snapshotCopy,
      createdAt: serverTimestamp(),
    });

    await recordCMSAuditLog(
      'Publish Live',
      'Publishing System',
      `Published configuration to live website: ${revisionLabel}`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Restore a previous revision snapshot
 */
export async function restoreSiteRevision(
  snapshotData: CMSSiteConfigData,
  revisionLabel: string,
  actorEmail: string
): Promise<void> {
  await publishSiteConfig(
    snapshotData,
    actorEmail,
    `Restored revision: ${revisionLabel}`
  );
}

/**
 * Save or update a Banner in /cms_banners/{id}
 */
export async function saveCMSBanner(
  banner: Omit<CMSBannerItem, 'updatedAt'>,
  actorEmail: string
): Promise<void> {
  const bannerId = banner.id || generateCMSId('bnr');
  const path = `cms_banners/${bannerId}`;
  try {
    await setDoc(doc(db, 'cms_banners', bannerId), {
      title: banner.title.trim().slice(0, 140),
      subtitle: (banner.subtitle || '').trim().slice(0, 500),
      imageUrl: (banner.imageUrl || '').trim().slice(0, 650000),
      buttonText: (banner.buttonText || '').trim().slice(0, 60),
      buttonLink: (banner.buttonLink || '').trim().slice(0, 300),
      bannerType: banner.bannerType,
      startDate: (banner.startDate || '').slice(0, 40),
      endDate: (banner.endDate || '').slice(0, 40),
      enabled: Boolean(banner.enabled),
      status: banner.status,
      updatedAt: serverTimestamp(),
    });
    await recordCMSAuditLog(
      banner.status === 'published' ? 'Publish Banner' : 'Save Banner Draft',
      'Banner Manager',
      `${banner.status === 'published' ? 'Published' : 'Saved draft'} banner "${banner.title}"`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCMSBanner(
  bannerId: string,
  bannerTitle: string,
  actorEmail: string
): Promise<void> {
  const path = `cms_banners/${bannerId}`;
  try {
    await deleteDoc(doc(db, 'cms_banners', bannerId));
    await recordCMSAuditLog(
      'Delete Banner',
      'Banner Manager',
      `Deleted banner "${bannerTitle}"`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save or update an Announcement in /cms_announcements/{id}
 */
export async function saveCMSAnnouncement(
  item: Omit<CMSAnnouncementItem, 'updatedAt'>,
  actorEmail: string
): Promise<void> {
  const announcementId = item.id || generateCMSId('ann');
  const path = `cms_announcements/${announcementId}`;
  try {
    await setDoc(doc(db, 'cms_announcements', announcementId), {
      title: item.title.trim().slice(0, 140),
      message: item.message.trim().slice(0, 600),
      type: item.type,
      linkText: (item.linkText || '').trim().slice(0, 60),
      linkUrl: (item.linkUrl || '').trim().slice(0, 300),
      startDate: (item.startDate || '').slice(0, 40),
      expiryDate: (item.expiryDate || '').slice(0, 40),
      status: item.status,
      updatedAt: serverTimestamp(),
    });
    await recordCMSAuditLog(
      item.status === 'published' ? 'Publish Announcement' : 'Save Announcement Draft',
      'Announcement Manager',
      `${item.status === 'published' ? 'Published' : 'Unpublished/Draft'} announcement "${item.title}"`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCMSAnnouncement(
  announcementId: string,
  title: string,
  actorEmail: string
): Promise<void> {
  const path = `cms_announcements/${announcementId}`;
  try {
    await deleteDoc(doc(db, 'cms_announcements', announcementId));
    await recordCMSAuditLog(
      'Delete Announcement',
      'Announcement Manager',
      `Deleted announcement "${title}"`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save or update an Event in /cms_events/{id}
 */
export async function saveCMSEvent(
  eventItem: Omit<CMSEventItem, 'updatedAt'>,
  actorEmail: string
): Promise<void> {
  const eventId = eventItem.id || generateCMSId('evt');
  const path = `cms_events/${eventId}`;
  try {
    await setDoc(doc(db, 'cms_events', eventId), {
      title: eventItem.title.trim().slice(0, 140),
      description: eventItem.description.trim().slice(0, 1500),
      eventDate: (eventItem.eventDate || '').slice(0, 50),
      location: (eventItem.location || '').trim().slice(0, 120),
      posterUrl: (eventItem.posterUrl || '').trim().slice(0, 650000),
      registrationLink: (eventItem.registrationLink || '').trim().slice(0, 300),
      status: eventItem.status,
      updatedAt: serverTimestamp(),
    });
    await recordCMSAuditLog(
      eventItem.status === 'published' ? 'Publish Event' : 'Save Event Draft',
      'Event Manager',
      `${eventItem.status === 'published' ? 'Published' : 'Saved draft'} event "${eventItem.title}"`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCMSEvent(
  eventId: string,
  title: string,
  actorEmail: string
): Promise<void> {
  const path = `cms_events/${eventId}`;
  try {
    await deleteDoc(doc(db, 'cms_events', eventId));
    await recordCMSAuditLog(
      'Delete Event',
      'Event Manager',
      `Deleted event "${title}"`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Compress an uploaded image File into an optimized web Data URL (max 1200px width, JPEG 0.82)
 * so uploads work reliably and quickly even if Firebase Storage bucket rules are restricted.
 */
async function optimizeImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image to Firebase Storage (with resilient optimized fallback) and register in /cms_media/{id}
 */
export async function uploadCMSMediaAsset(
  file: File,
  title: string,
  altText: string,
  category: 'banner' | 'event_poster' | 'seo_social' | 'general',
  actorEmail: string
): Promise<CMSMediaAssetItem> {
  const mediaId = generateCMSId('media');
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `cms_uploads/${mediaId}_${safeFileName}`;
  let downloadUrl = '';

  try {
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    downloadUrl = await getDownloadURL(snapshot.ref);
  } catch {
    // Fallback to optimized compressed image data URL if Storage bucket rules are unconfigured
    downloadUrl = await optimizeImageFileToDataUrl(file);
  }

  const path = `cms_media/${mediaId}`;
  try {
    const payload = {
      title: (title.trim() || file.name).slice(0, 120),
      altText: (altText.trim() || title.trim() || file.name).slice(0, 200),
      category,
      url: downloadUrl.slice(0, 650000),
      storagePath: storagePath.slice(0, 300),
      mimeType: (file.type || 'image/jpeg').slice(0, 60),
      sizeBytes: file.size,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'cms_media', mediaId), payload);
    await recordCMSAuditLog(
      'Upload Media',
      'Media Manager',
      `Uploaded media asset "${payload.title}" (${category})`,
      actorEmail
    );
    return {
      id: mediaId,
      ...payload,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCMSMediaAsset(
  media: CMSMediaAssetItem,
  actorEmail: string
): Promise<void> {
  if (media.storagePath && !media.url.startsWith('data:')) {
    try {
      const storageRef = ref(storage, media.storagePath);
      await deleteObject(storageRef);
    } catch {
      // Ignore if object already removed from Storage
    }
  }

  const path = `cms_media/${media.id}`;
  try {
    await deleteDoc(doc(db, 'cms_media', media.id));
    await recordCMSAuditLog(
      'Delete Media',
      'Media Manager',
      `Removed media asset "${media.title}"`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Moderate a community feedback document in /community_feedback/{id}
 */
export async function updateCommunityFeedbackStatus(
  feedbackId: string,
  existingDocData: Record<string, unknown>,
  newStatus: 'approved' | 'rejected' | 'pending_review' | 'suspended',
  actorEmail: string
): Promise<void> {
  const path = `community_feedback/${feedbackId}`;
  try {
    await setDoc(doc(db, 'community_feedback', feedbackId), {
      testerName: existingDocData.testerName,
      role: existingDocData.role,
      city: existingDocData.city,
      category: existingDocData.category,
      rating: existingDocData.rating,
      comment: existingDocData.comment,
      status: newStatus,
      createdAt: existingDocData.createdAt,
    });
    await recordCMSAuditLog(
      'Moderate Feedback',
      'Website Content Editor',
      `Set community feedback from "${existingDocData.testerName}" to ${newStatus}`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Activate, approve, reject, or suspend a Service Provider account in /service_providers/{id}
 */
export async function updateServiceProviderStatus(
  providerId: string,
  existingDocData: Record<string, unknown>,
  newStatus: 'pending_verification' | 'approved' | 'rejected' | 'active' | 'suspended',
  actorEmail: string
): Promise<void> {
  const path = `service_providers/${providerId}`;
  try {
    await setDoc(doc(db, 'service_providers', providerId), {
      fullName: existingDocData.fullName,
      phone: existingDocData.phone,
      email: existingDocData.email,
      category: existingDocData.category,
      city: existingDocData.city,
      state: existingDocData.state,
      experienceYears: Number(existingDocData.experienceYears) || 0,
      bio: existingDocData.bio,
      status: newStatus,
      createdAt: existingDocData.createdAt,
    });
    await recordCMSAuditLog(
      newStatus === 'suspended' ? 'Suspend Provider' : 'Activate / Verify Provider',
      'User Management',
      `Updated service provider "${existingDocData.fullName}" (${existingDocData.email}) status to ${newStatus}`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Activate, resolve, or suspend a Customer Inquiry record in /contact_inquiries/{id}
 */
export async function updateContactInquiryStatus(
  inquiryId: string,
  existingDocData: Record<string, unknown>,
  newStatus: 'pending' | 'reviewed' | 'resolved' | 'active' | 'suspended',
  actorEmail: string
): Promise<void> {
  const path = `contact_inquiries/${inquiryId}`;
  try {
    await setDoc(doc(db, 'contact_inquiries', inquiryId), {
      fullName: existingDocData.fullName,
      email: existingDocData.email,
      subject: existingDocData.subject,
      message: existingDocData.message,
      status: newStatus,
      createdAt: existingDocData.createdAt,
    });
    await recordCMSAuditLog(
      newStatus === 'suspended' ? 'Suspend Customer Account' : 'Update Customer Status',
      'User Management',
      `Updated customer "${existingDocData.fullName}" (${existingDocData.email}) status to ${newStatus}`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Activate, review, or suspend a Customer Activity Report record in /activity_reports/{id}
 */
export async function updateActivityReportStatus(
  reportId: string,
  existingDocData: Record<string, unknown>,
  newStatus: 'new' | 'in_review' | 'contacted' | 'active' | 'suspended',
  actorEmail: string
): Promise<void> {
  const path = `activity_reports/${reportId}`;
  try {
    const payload: Record<string, unknown> = {
      actionType: existingDocData.actionType,
      customerName: existingDocData.customerName,
      customerEmail: existingDocData.customerEmail,
      details: existingDocData.details,
      status: newStatus,
      createdAt: existingDocData.createdAt,
    };
    if (existingDocData.targetFeature) {
      payload.targetFeature = existingDocData.targetFeature;
    }
    await setDoc(doc(db, 'activity_reports', reportId), payload);
    await recordCMSAuditLog(
      newStatus === 'suspended' ? 'Suspend Customer Activity' : 'Update Customer Activity',
      'User Management',
      `Updated customer activity account "${existingDocData.customerName}" (${existingDocData.customerEmail}) to ${newStatus}`,
      actorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Record real website pageview in Firestore /site_analytics/traffic
 */
export async function recordWebsitePageView(pathName = 'home'): Promise<void> {
  try {
    const sessionKey = 'skillconnect_session_recorded';
    const isNewSession = typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey);
    if (typeof window !== 'undefined' && isNewSession) {
      sessionStorage.setItem(sessionKey, '1');
    }

    const refDoc = doc(db, 'site_analytics', 'traffic');
    const snap = await getDoc(refDoc);
    let totalPageViews = 1;
    let uniqueSessions = 1;

    if (snap.exists()) {
      const data = snap.data();
      totalPageViews = (Number(data.totalPageViews) || 0) + 1;
      uniqueSessions = (Number(data.uniqueSessions) || 0) + (isNewSession ? 1 : 0);
    }

    await setDoc(refDoc, {
      totalPageViews,
      uniqueSessions: Math.max(1, uniqueSessions),
      lastPath: String(pathName).slice(0, 40),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-blocking telemetry
  }
}

/**
 * Fetch real website traffic analytics from Firestore /site_analytics/traffic
 */
export async function fetchWebsiteTrafficAnalytics(): Promise<{
  totalPageViews: number;
  uniqueSessions: number;
  lastPath?: string;
}> {
  try {
    const snap = await getDoc(doc(db, 'site_analytics', 'traffic'));
    if (snap.exists()) {
      const d = snap.data();
      return {
        totalPageViews: Number(d.totalPageViews) || 1,
        uniqueSessions: Number(d.uniqueSessions) || 1,
        lastPath: typeof d.lastPath === 'string' ? d.lastPath : 'home',
      };
    }
  } catch {
    // Fallback if not yet initialized
  }
  return { totalPageViews: 1, uniqueSessions: 1, lastPath: 'home' };
}

/**
 * Fetch public published banners, announcements, events, and approved feedback
 */
export async function fetchPublishedPublicCMSCollections(): Promise<{
  banners: CMSBannerItem[];
  announcements: CMSAnnouncementItem[];
  events: CMSEventItem[];
  publishedConfig: CMSSiteConfigData | null;
}> {
  let publishedConfig: CMSSiteConfigData | null = null;
  const banners: CMSBannerItem[] = [];
  const announcements: CMSAnnouncementItem[] = [];
  const events: CMSEventItem[] = [];

  try {
    const configSnap = await getDoc(doc(db, 'cms_config', 'site_published'));
    if (configSnap.exists()) {
      publishedConfig = configSnap.data() as CMSSiteConfigData;
    }
  } catch {
    // Use default fallback if not yet created
  }

  try {
    const bSnap = await getDocs(
      query(collection(db, 'cms_banners'), where('status', '==', 'published'))
    );
    bSnap.forEach((d) => {
      banners.push({ id: d.id, ...(d.data() as Omit<CMSBannerItem, 'id'>) });
    });
  } catch {
    // Ignore if empty
  }

  try {
    const aSnap = await getDocs(
      query(collection(db, 'cms_announcements'), where('status', '==', 'published'))
    );
    aSnap.forEach((d) => {
      announcements.push({
        id: d.id,
        ...(d.data() as Omit<CMSAnnouncementItem, 'id'>),
      });
    });
  } catch {
    // Ignore if empty
  }

  try {
    const eSnap = await getDocs(
      query(collection(db, 'cms_events'), where('status', '==', 'published'))
    );
    eSnap.forEach((d) => {
      events.push({ id: d.id, ...(d.data() as Omit<CMSEventItem, 'id'>) });
    });
  } catch {
    // Ignore if empty
  }

  return { banners, announcements, events, publishedConfig };
}

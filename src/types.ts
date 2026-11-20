export type PageView = 
  | 'home' 
  | 'about' 
  | 'features' 
  | 'showcase' 
  | 'launch' 
  | 'feedback'
  | 'contact' 
  | 'privacy' 
  | 'terms' 
  | 'disclaimer' 
  | 'deletion'
  | 'founder-cms';

export type FeatureStatus = 
  | 'Core Architecture' 
  | 'Launch Feature (8 Nov 2026)' 
  | 'In Development (Post-Launch)';

export type FeatureCategory = 'Exchange & Mentorship' | 'Portfolios & Verification' | 'Apprenticeship & Gigs' | 'Platform Security';

export interface VerifiedFeature {
  id: string;
  title: string;
  category: FeatureCategory;
  status: FeatureStatus;
  summary: string;
  details: string[];
  iconName: string;
}

export interface AppScreenMockup {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  screenType: 'feed' | 'profile' | 'chat' | 'opportunities';
}

export interface CMSHomepageSectionToggle {
  id: 'about' | 'features' | 'showcase' | 'events' | 'feedback' | 'launch' | 'contact';
  label: string;
  visible: boolean;
  order: number;
}

export interface CMSHomepageConfig {
  tagline: string;
  mainHeadingLine1: string;
  mainHeadingHighlight: string;
  description: string;
  launchDateString: string;
  sections: CMSHomepageSectionToggle[];
}

export interface CMSAboutPillar {
  title: string;
  description: string;
}

export interface CMSAboutConfig {
  kicker: string;
  heading: string;
  introParagraph: string;
  founderQuote1: string;
  founderQuote2: string;
  pillars: CMSAboutPillar[];
}

export interface CMSContactConfig {
  founderName: string;
  founderRole: string;
  founderEmail: string;
  founderInstagramUrl: string;
  founderInstagramHandle: string;
  platformInstagramUrl: string;
  playStoreUrl: string;
  contactHeading: string;
  contactSubtitle: string;
  responseSla: string;
}

export interface CMSPageSEO {
  title: string;
  description: string;
}

export interface CMSSEOConfig {
  canonicalUrl: string;
  keywords: string;
  ogImageUrl: string;
  twitterImageUrl: string;
  pages: Record<string, CMSPageSEO>;
}

export interface CMSTestimonialItem {
  id: string;
  name: string;
  role: string;
  city: string;
  state: string;
  category: 'trades' | 'tech' | 'mentorship';
  badge: string;
  rating: number;
  date: string;
  quote: string;
  featureTested: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface CMSFAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Providers' | 'Customers' | 'Security & Launch';
}

export interface CMSCustomizationConfig {
  defaultTheme: 'dark' | 'light';
  accentPreset: 'cyan-emerald' | 'blue-purple' | 'emerald-cyan';
  showAnnouncementBar: boolean;
  showPromotionalBanners: boolean;
  promoRibbonText: string;
}

export interface CMSSiteConfigData {
  status: 'draft' | 'published';
  homepage: CMSHomepageConfig;
  about: CMSAboutConfig;
  contact: CMSContactConfig;
  seo: CMSSEOConfig;
  services: VerifiedFeature[];
  testimonials: CMSTestimonialItem[];
  faqs?: CMSFAQItem[];
  customization?: CMSCustomizationConfig;
  updatedBy: string;
  updatedAt?: unknown;
}

export interface CMSBannerItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  bannerType: 'promotional' | 'event';
  startDate: string;
  endDate: string;
  enabled: boolean;
  status: 'draft' | 'published';
  updatedAt?: unknown;
}

export interface CMSAnnouncementItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'launch' | 'event' | 'alert' | 'festival';
  linkText: string;
  linkUrl: string;
  startDate: string;
  expiryDate: string;
  status: 'draft' | 'published';
  updatedAt?: unknown;
}

export interface CMSEventItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  posterUrl: string;
  registrationLink: string;
  status: 'draft' | 'published';
  updatedAt?: unknown;
}

export interface CMSMediaAssetItem {
  id: string;
  title: string;
  altText: string;
  category: 'banner' | 'event_poster' | 'seo_social' | 'general';
  url: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: unknown;
}

export interface CMSRevisionItem {
  id: string;
  label: string;
  authorEmail: string;
  snapshotData: CMSSiteConfigData;
  createdAt?: unknown;
}

export interface CMSAuditLogItem {
  id: string;
  action: string;
  module: string;
  summary: string;
  actorEmail: string;
  createdAt?: unknown;
}

import type React from 'react';
import type { PageView } from '../types.ts';

export const OFFICIAL_DOMAIN = 'https://skillconnectofficial.cloud.run';

export const VIEW_TO_PATH: Record<PageView, string> = {
  home: '/',
  about: '/about',
  features: '/features',
  showcase: '/showcase',
  launch: '/launch',
  feedback: '/feedback',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  disclaimer: '/disclaimer',
  deletion: '/deletion',
  'founder-cms': '/founder-cms',
};

const VALID_VIEWS: PageView[] = [
  'home',
  'about',
  'features',
  'showcase',
  'launch',
  'feedback',
  'contact',
  'privacy',
  'terms',
  'disclaimer',
  'deletion',
  'founder-cms',
];

export type SitemapChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SitemapRouteConfig {
  path: string;
  view: Exclude<PageView, 'founder-cms'>;
  changefreq: SitemapChangeFreq;
  priority: string;
  sourceFiles: string[];
}

/**
 * Dynamic registry of all public indexable routes for sitemap.xml generation.
 * Excludes private/administrative routes such as '/founder-cms'.
 */
export const PUBLIC_SITEMAP_ROUTES: SitemapRouteConfig[] = [
  {
    path: '/',
    view: 'home',
    changefreq: 'daily',
    priority: '1.0',
    sourceFiles: ['index.html', 'src/App.tsx', 'src/components/HeroSection.tsx'],
  },
  {
    path: '/about',
    view: 'about',
    changefreq: 'weekly',
    priority: '0.9',
    sourceFiles: ['src/components/AboutSection.tsx', 'src/data/websiteContent.ts'],
  },
  {
    path: '/features',
    view: 'features',
    changefreq: 'weekly',
    priority: '0.9',
    sourceFiles: ['src/components/FeaturesSection.tsx', 'src/data/websiteContent.ts'],
  },
  {
    path: '/services',
    view: 'features',
    changefreq: 'weekly',
    priority: '0.9',
    sourceFiles: ['src/components/FeaturesSection.tsx', 'src/data/websiteContent.ts'],
  },
  {
    path: '/showcase',
    view: 'showcase',
    changefreq: 'weekly',
    priority: '0.8',
    sourceFiles: ['src/components/AppShowcaseSection.tsx'],
  },
  {
    path: '/launch',
    view: 'launch',
    changefreq: 'weekly',
    priority: '0.8',
    sourceFiles: ['src/components/LaunchInfoSection.tsx'],
  },
  {
    path: '/feedback',
    view: 'feedback',
    changefreq: 'daily',
    priority: '0.8',
    sourceFiles: ['src/components/CommunityFeedbackSection.tsx'],
  },
  {
    path: '/contact',
    view: 'contact',
    changefreq: 'monthly',
    priority: '0.8',
    sourceFiles: ['src/components/ContactSection.tsx'],
  },
  {
    path: '/privacy',
    view: 'privacy',
    changefreq: 'monthly',
    priority: '0.5',
    sourceFiles: ['src/components/LegalSection.tsx'],
  },
  {
    path: '/terms',
    view: 'terms',
    changefreq: 'monthly',
    priority: '0.5',
    sourceFiles: ['src/components/LegalSection.tsx'],
  },
  {
    path: '/disclaimer',
    view: 'disclaimer',
    changefreq: 'monthly',
    priority: '0.5',
    sourceFiles: ['src/components/LegalSection.tsx'],
  },
  {
    path: '/deletion',
    view: 'deletion',
    changefreq: 'monthly',
    priority: '0.5',
    sourceFiles: ['src/components/AccountDeletionSection.tsx'],
  },
];

/**
 * Formats a Date, timestamp, Firestore Timestamp, or date string into a valid W3C Datetime (YYYY-MM-DD) for <lastmod>.
 */
export function formatSitemapLastMod(input?: unknown): string {
  if (input === undefined || input === null) {
    return new Date().toISOString().split('T')[0];
  }
  if (input instanceof Date) {
    const validDate = Number.isNaN(input.getTime()) ? new Date() : input;
    return validDate.toISOString().split('T')[0];
  }
  if (typeof input === 'number' || typeof input === 'string') {
    const parsed = new Date(input);
    const validDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return validDate.toISOString().split('T')[0];
  }
  if (typeof input === 'object') {
    const maybeTimestamp = input as { toDate?: () => Date; seconds?: number };
    if (typeof maybeTimestamp.toDate === 'function') {
      const d = maybeTimestamp.toDate();
      if (d instanceof Date && !Number.isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
    if (typeof maybeTimestamp.seconds === 'number') {
      return new Date(maybeTimestamp.seconds * 1000).toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface GenerateSitemapOptions {
  baseUrl?: string;
  defaultLastMod?: unknown;
  lastModByPath?: Record<string, unknown>;
}

/**
 * Dynamically generates a standards-compliant sitemap.xml including all public routes
 * and properly populated <lastmod>, <changefreq>, and <priority> tags.
 */
export function generateSitemapXml(options: GenerateSitemapOptions = {}): string {
  const normalizedBaseUrl = (options.baseUrl || OFFICIAL_DOMAIN).replace(/\/+$/, '');
  const fallbackLastMod = formatSitemapLastMod(options.defaultLastMod);

  const urlEntries = PUBLIC_SITEMAP_ROUTES.map((route) => {
    const loc = route.path === '/' ? `${normalizedBaseUrl}/` : `${normalizedBaseUrl}${route.path}`;
    const routeSpecificLastMod = options.lastModByPath?.[route.path];
    const lastmod = routeSpecificLastMod
      ? formatSitemapLastMod(routeSpecificLastMod)
      : fallbackLastMod;

    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n');
}

export const PUBLIC_ROBOTS_TAG_HEADER =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
export const PRIVATE_ROBOTS_TAG_HEADER = 'noindex, nofollow';

/**
 * Returns the appropriate X-Robots-Tag HTTP response header value for a given URL path.
 * Ensures all public routes and static SEO files explicitly allow indexing.
 */
export function getXRobotsTagForPath(urlPath?: string): string {
  const cleanPath = (urlPath || '/').split('?')[0].replace(/\/+$/, '').toLowerCase() || '/';
  if (cleanPath === '/founder-cms') {
    return PRIVATE_ROBOTS_TAG_HEADER;
  }
  return PUBLIC_ROBOTS_TAG_HEADER;
}

/**
 * Generates the official public robots.txt file content allowing all public routes
 * for Googlebot (Desktop & Mobile), Bingbot, and AdSense crawlers while disallowing /founder-cms.
 */
export function generateRobotsTxt(baseUrl: string = OFFICIAL_DOMAIN): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const allowLines = PUBLIC_SITEMAP_ROUTES.map((route) => `Allow: ${route.path}`);

  return [
    '# SkillConnect Official Website robots.txt',
    `# Official Domain: ${normalizedBaseUrl}/`,
    '',
    'User-agent: *',
    ...allowLines,
    'Allow: /ads.txt',
    'Allow: /sitemap.xml',
    'Allow: /robots.txt',
    'Allow: /assets/',
    'Disallow: /founder-cms',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    'Disallow: /founder-cms',
    '',
    'User-agent: Googlebot-Mobile',
    'Allow: /',
    'Disallow: /founder-cms',
    '',
    'User-agent: Googlebot-Image',
    'Allow: /',
    '',
    'User-agent: Mediapartners-Google',
    'Allow: /',
    'Allow: /ads.txt',
    '',
    'User-agent: AdsBot-Google',
    'Allow: /',
    'Allow: /ads.txt',
    '',
    'User-agent: Bingbot',
    'Allow: /',
    'Disallow: /founder-cms',
    '',
    `Sitemap: ${normalizedBaseUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

export const PUBLIC_ROUTE_BREADCRUMB_LABELS: Record<string, string> = {
  '/': 'Home',
  '/about': 'About Us & Leadership',
  '/features': 'Verified Features & Services',
  '/services': 'Skill-Based Services Marketplace',
  '/showcase': 'Mobile App Showcase',
  '/launch': 'Launch Information (8 Nov 2026)',
  '/feedback': 'Community Feedback & Reviews',
  '/contact': 'Contact Us & Inquiries',
  '/privacy': 'Privacy Policy (GDPR / DPDP)',
  '/terms': 'Terms & Conditions',
  '/disclaimer': 'Platform Disclaimer',
  '/deletion': 'Account & Data Deletion Protocol',
};

/**
 * Generates Schema.org BreadcrumbList JSON-LD structured data for a given public route or PageView.
 */
export function buildBreadcrumbJsonLdForView(view: PageView, currentPath?: string) {
  const activePath =
    currentPath && PUBLIC_ROUTE_BREADCRUMB_LABELS[currentPath]
      ? currentPath
      : getViewPath(view === 'founder-cms' ? 'home' : view);

  const items: Array<Record<string, unknown>> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'SkillConnect Official',
      item: `${OFFICIAL_DOMAIN}/`,
    },
  ];

  if (activePath !== '/' && PUBLIC_ROUTE_BREADCRUMB_LABELS[activePath]) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: PUBLIC_ROUTE_BREADCRUMB_LABELS[activePath],
      item: `${OFFICIAL_DOMAIN}${activePath}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id':
      activePath === '/'
        ? `${OFFICIAL_DOMAIN}/#breadcrumb`
        : `${OFFICIAL_DOMAIN}${activePath}#breadcrumb`,
    itemListElement: items,
  };
}

/**
 * Returns the clean canonical pathname for a given PageView (e.g. '/about', '/features', '/').
 * Preserves '/services' when the user or crawler is on '/services'.
 */
export function getViewPath(view: PageView, currentPath?: string): string {
  if (view === 'features' && currentPath) {
    const clean = currentPath.split('?')[0].replace(/\/+$/, '').toLowerCase() || '/';
    if (clean === '/services') {
      return '/services';
    }
  }
  return VIEW_TO_PATH[view] || '/';
}

/**
 * Returns the full canonical URL on https://skillconnectofficial.cloud.run for a given PageView.
 */
export function getCanonicalUrlForView(view: PageView, currentPath?: string): string {
  if (view === 'home' || view === 'founder-cms') {
    return `${OFFICIAL_DOMAIN}/`;
  }
  return `${OFFICIAL_DOMAIN}${getViewPath(view, currentPath)}`;
}

/**
 * Resolves the active PageView from window.location.pathname or window.location.hash.
 * Supports both clean URLs (/about, /features, /services, /contact) and legacy #hash URLs (#about).
 */
export function resolveViewFromLocation(): PageView {
  if (typeof window === 'undefined') return 'home';

  const rawPath = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  const pathSegment = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;

  if (pathSegment === 'services') {
    return 'features';
  }
  if (VALID_VIEWS.includes(pathSegment as PageView)) {
    return pathSegment as PageView;
  }

  const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (rawHash === 'services') {
    return 'features';
  }
  if (VALID_VIEWS.includes(rawHash as PageView)) {
    return rawHash as PageView;
  }

  return 'home';
}

/**
 * Normalizes internal CMS links (converting legacy '#features' or '#launch' to clean paths '/features', '/launch')
 * and resolves the corresponding PageView when the link points to an internal route.
 */
export function parseInternalCmsLink(rawUrl?: string): {
  href: string;
  isExternal: boolean;
  targetView?: PageView;
  explicitPath?: string;
} {
  const trimmed = (rawUrl || '/').trim();
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return { href: trimmed, isExternal: true };
  }

  const normalizedSlug = trimmed.replace(/^[#/]+/, '').replace(/\/+$/, '').toLowerCase();
  if (normalizedSlug === '' || normalizedSlug === 'home') {
    return { href: '/', isExternal: false, targetView: 'home', explicitPath: '/' };
  }
  if (normalizedSlug === 'services') {
    return { href: '/services', isExternal: false, targetView: 'features', explicitPath: '/services' };
  }
  if (VALID_VIEWS.includes(normalizedSlug as PageView) && normalizedSlug !== 'founder-cms') {
    const view = normalizedSlug as PageView;
    const path = VIEW_TO_PATH[view];
    return { href: path, isExternal: false, targetView: view, explicitPath: path };
  }

  return { href: trimmed.startsWith('/') ? trimmed : `/${trimmed}`, isExternal: false };
}

/**
 * Helper for semantic <a href={getViewPath(view)}> links that preserves standard browser
 * middle-click / Cmd+click / right-click behavior and crawler indexing while using
 * SPA navigation on unmodified left-clicks.
 */
export function handleSpaLinkClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  view: PageView,
  onNavigate: (view: PageView, explicitPath?: string) => void,
  explicitPath?: string
) {
  if (
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey
  ) {
    return;
  }
  e.preventDefault();
  onNavigate(view, explicitPath);
}

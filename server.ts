import dotenv from 'dotenv';
import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import {
  PUBLIC_SITEMAP_ROUTES,
  formatSitemapLastMod,
  generateRobotsTxt,
  generateSitemapXml,
  getXRobotsTagForPath,
} from './src/utils/seoRouting.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const PROJECT_ROOT = import.meta.dirname;
const PUBLIC_ROUTE_SET = new Set(PUBLIC_SITEMAP_ROUTES.map((r) => r.path));

interface GroundingSource {
  title: string;
  url: string;
}

interface InsightsPayload {
  query: string;
  focus: string;
  answer: string;
  sources: GroundingSource[];
  searchQueries: string[];
  grounded: boolean;
  generatedAt: string;
}

const INSIGHTS_CACHE_TTL_MS = 15 * 60 * 1000;
const insightsCache = new Map<string, { expiresAt: number; data: InsightsPayload }>();
const inFlightInsights = new Map<string, Promise<InsightsPayload>>();

function buildDynamicSitemap(): string {
  const lastModByPath: Record<string, string> = {};
  const todayFormatted = formatSitemapLastMod(new Date());

  for (const route of PUBLIC_SITEMAP_ROUTES) {
    let latestMtimeMs = 0;
    for (const relFile of route.sourceFiles) {
      const fullPath = path.resolve(PROJECT_ROOT, relFile);
      try {
        if (fs.existsSync(fullPath)) {
          const stat = fs.statSync(fullPath);
          if (stat.mtimeMs > latestMtimeMs) {
            latestMtimeMs = stat.mtimeMs;
          }
        }
      } catch {
        // Ignore stat read errors and fall back to todayFormatted
      }
    }
    lastModByPath[route.path] =
      latestMtimeMs > 0 ? formatSitemapLastMod(latestMtimeMs) : todayFormatted;
  }

  return generateSitemapXml({
    defaultLastMod: todayFormatted,
    lastModByPath,
  });
}

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function fetchGroundedInsights(
  ai: GoogleGenAI,
  rawQuery: string,
  focusArea: string
): Promise<InsightsPayload> {
  const prompt = [
    `Topic category: ${focusArea || 'Skill-Based Services in India'}`,
    `User question: ${rawQuery}`,
    'Provide an up-to-date, factual briefing focused on India’s skill-based services economy, customer demand, verified freelancer capabilities, or mentoring benchmarks. Keep it concise (3 short paragraphs or bullet points max), objective, and directly useful for Indian customers or service providers.',
  ].join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction:
        'You are the market research assistant for SkillConnect Official (skillconnectofficial.cloud.run), an Indian skill-based services marketplace. Ground your response in current Google Search results. Present concise, factual insights with zero hype or fabricated statistics.',
      tools: [{ googleSearch: {} }],
    },
  });

  const answer = (response.text || '').trim();
  const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const seenUrls = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const chunk of rawChunks) {
    const web = (chunk as { web?: { uri?: string; title?: string } })?.web;
    const uri = web?.uri?.trim();
    if (!uri || !/^https?:\/\//i.test(uri) || seenUrls.has(uri)) continue;
    seenUrls.add(uri);
    sources.push({
      title: (web?.title || new URL(uri).hostname).trim(),
      url: uri,
    });
  }

  const rawSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries;
  const searchQueries = Array.isArray(rawSearchQueries)
    ? rawSearchQueries.filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    : [];

  return {
    query: rawQuery,
    focus: focusArea,
    answer,
    sources,
    searchQueries,
    grounded: sources.length > 0,
    generatedAt: new Date().toISOString(),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  // Global security & crawler indexing headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    const cleanUrl = (req.path || '/').replace(/\/+$/, '') || '/';
    if (!cleanUrl.startsWith('/api')) {
      res.setHeader('X-Robots-Tag', getXRobotsTagForPath(cleanUrl));
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Health probe
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Live Indian Skill & Market Intelligence grounded via Google Search (gemini-4-hydrogen)
  app.post('/api/skill-insights', async (req: Request, res: Response) => {
    const rawQuery = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const focusArea = typeof req.body?.focus === 'string' ? req.body.focus.trim() : 'General';

    if (rawQuery.length < 3 || rawQuery.length > 220) {
      res.status(400).json({
        error: 'Please enter a specific skill or service market question (between 3 and 220 characters).',
      });
      return;
    }

    const cacheKey = `${focusArea.toLowerCase()}::${rawQuery.toLowerCase()}`;
    const cached = insightsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.json(cached.data);
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: 'Live market insights service requires a configured GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    try {
      let pending = inFlightInsights.get(cacheKey);
      if (!pending) {
        pending = fetchGroundedInsights(ai, rawQuery, focusArea).finally(() => {
          inFlightInsights.delete(cacheKey);
        });
        inFlightInsights.set(cacheKey, pending);
      }

      const payload = await pending;
      if (!payload.answer) {
        res.status(502).json({
          error: 'Could not retrieve an updated answer for that query. Try refining your question.',
        });
        return;
      }

      if (insightsCache.size >= 100) {
        const oldestKey = insightsCache.keys().next().value;
        if (oldestKey) insightsCache.delete(oldestKey);
      }
      insightsCache.set(cacheKey, {
        expiresAt: Date.now() + INSIGHTS_CACHE_TTL_MS,
        data: payload,
      });

      res.json(payload);
    } catch (error: unknown) {
      const errStatus = (error as { status?: number })?.status;
      const errMsg = error instanceof Error ? error.message : '';
      const isQuotaIssue =
        errStatus === 429 ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.toLowerCase().includes('quota');
      const isAuthIssue =
        errStatus === 400 ||
        errStatus === 403 ||
        errMsg.includes('API_KEY') ||
        errMsg.includes('PERMISSION_DENIED');

      if (isQuotaIssue) {
        console.warn('Gemini search insights quota/rate limit reached (429).');
        res.status(429).json({
          rateLimited: true,
          error:
            'Live search insights quota has been reached for this API key. Upgrade to a paid tier or select a billing-enabled key in Settings > Secrets to increase your quota, or try again shortly.',
        });
        return;
      }

      if (isAuthIssue) {
        console.warn('Gemini search insights authentication error:', errStatus ?? 'auth');
        res.status(503).json({
          error: 'Live search insights requires a valid GEMINI_API_KEY in Settings > Secrets.',
        });
        return;
      }

      console.warn('Gemini search insights transient failure:', errStatus ?? 'unknown');
      res.status(502).json({
        error: 'Unable to fetch live search-grounded market insights right now. Please try again shortly.',
      });
    }
  });

  // Dynamic SEO endpoints (robots.txt, sitemap.xml, ads.txt, Search Console files)
  app.get('/robots.txt', (_req: Request, res: Response) => {
    const robotsPath = path.resolve(PROJECT_ROOT, 'public', 'robots.txt');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    if (fs.existsSync(robotsPath)) {
      res.sendFile(robotsPath);
      return;
    }
    res.send(generateRobotsTxt());
  });

  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buildDynamicSitemap());
  });

  app.get('/ads.txt', (_req: Request, res: Response, next: NextFunction) => {
    const prodAdsPath = path.resolve(PROJECT_ROOT, 'dist', 'ads.txt');
    const pubAdsPath = path.resolve(PROJECT_ROOT, 'public', 'ads.txt');
    const targetPath = fs.existsSync(prodAdsPath)
      ? prodAdsPath
      : fs.existsSync(pubAdsPath)
      ? pubAdsPath
      : null;

    if (!targetPath) {
      next();
      return;
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(targetPath);
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use((req: Request, _res: Response, next: NextFunction) => {
      const cleanUrl = (req.url?.split('?')[0] || '/').replace(/\/+$/, '') || '/';
      const assetMatch = cleanUrl.match(
        /^\/[^/]+(\/(?:assets|favicon[^/]*|apple-touch-icon\.png|icon-192\.png).*)$/
      );
      if (assetMatch) {
        req.url = assetMatch[1];
      } else if (cleanUrl !== '/' && PUBLIC_ROUTE_SET.has(cleanUrl)) {
        req.url = '/';
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(PROJECT_ROOT, 'dist');
    app.use((req: Request, _res: Response, next: NextFunction) => {
      const cleanUrl = (req.url?.split('?')[0] || '/').replace(/\/+$/, '') || '/';
      const assetMatch = cleanUrl.match(
        /^\/[^/]+(\/(?:assets|favicon[^/]*|apple-touch-icon\.png|icon-192\.png).*)$/
      );
      if (assetMatch) {
        req.url = assetMatch[1];
      }
      next();
    });

    app.use(express.static(distDir));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillConnect Official server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SkillConnect server:', err);
  process.exit(1);
});

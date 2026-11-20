import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';
import {
  PUBLIC_SITEMAP_ROUTES,
  formatSitemapLastMod,
  generateRobotsTxt,
  generateSitemapXml,
  getXRobotsTagForPath,
} from './src/utils/seoRouting.ts';

function buildDynamicSitemapForProject(projectRoot: string): string {
  const lastModByPath: Record<string, string> = {};
  const todayFormatted = formatSitemapLastMod(new Date());

  for (const route of PUBLIC_SITEMAP_ROUTES) {
    let latestMtimeMs = 0;
    for (const relFile of route.sourceFiles) {
      const fullPath = path.resolve(projectRoot, relFile);
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

export default defineConfig(() => {
  const projectRoot = import.meta.dirname;
  const publicRouteSet = new Set(PUBLIC_SITEMAP_ROUTES.map((r) => r.path));

  return {
    base: './',
    publicDir: 'public',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-and-generate-seo-files',
        buildStart() {
          try {
            const publicDir = path.resolve(projectRoot, 'public');
            if (fs.existsSync(publicDir)) {
              const xml = buildDynamicSitemapForProject(projectRoot);
              fs.writeFileSync(path.resolve(publicDir, 'sitemap.xml'), xml, 'utf-8');
              const robotsContent = generateRobotsTxt();
              fs.writeFileSync(path.resolve(publicDir, 'robots.txt'), robotsContent, 'utf-8');
            }
          } catch {
            // Ignore write errors in read-only environments
          }
        },
        closeBundle() {
          try {
            const distDir = path.resolve(projectRoot, 'dist');
            if (fs.existsSync(distDir)) {
              const xml = buildDynamicSitemapForProject(projectRoot);
              fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), xml, 'utf-8');
              const robotsContent = generateRobotsTxt();
              fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robotsContent, 'utf-8');
            }
          } catch {
            // Ignore write errors in read-only environments
          }
        },
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const cleanUrl = (req.url?.split('?')[0] || '/').replace(/\/+$/, '') || '/';

            // Ensure X-Robots-Tag header never blocks public route indexing + add safe security headers
            res.setHeader('X-Robots-Tag', getXRobotsTagForPath(cleanUrl));
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

            if (cleanUrl === '/robots.txt') {
              const robotsPath = path.resolve(projectRoot, 'public', 'robots.txt');
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.setHeader('Cache-Control', 'public, max-age=3600');
              res.statusCode = 200;
              if (fs.existsSync(robotsPath)) {
                fs.createReadStream(robotsPath).pipe(res);
              } else {
                res.end(generateRobotsTxt());
              }
              return;
            }

            if (cleanUrl === '/ads.txt') {
              const adsPath = path.resolve(projectRoot, 'public', 'ads.txt');
              if (fs.existsSync(adsPath)) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                res.statusCode = 200;
                fs.createReadStream(adsPath).pipe(res);
                return;
              }
            }

            if (cleanUrl === '/sitemap.xml') {
              const xml = buildDynamicSitemapForProject(projectRoot);
              res.setHeader('Content-Type', 'application/xml; charset=utf-8');
              res.setHeader('Cache-Control', 'public, max-age=3600');
              res.statusCode = 200;
              res.end(xml);
              return;
            }

            if (cleanUrl.startsWith('/google') && cleanUrl.endsWith('.html')) {
              const filePath = path.resolve(projectRoot, 'public', cleanUrl.slice(1));
              if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.statusCode = 200;
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            }

            // Normalize relative asset/favicon URLs requested from trailing-slash sub-routes (e.g. /about/assets/...)
            const assetMatch = cleanUrl.match(/^\/[^/]+(\/(?:assets|favicon[^/]*|apple-touch-icon\.png|icon-192\.png).*)$/);
            if (assetMatch) {
              req.url = assetMatch[1];
              next();
              return;
            }

            // Ensure clean public SPA routes (/about, /features, /services, /contact, etc.) resolve to /index.html
            if (cleanUrl !== '/' && publicRouteSet.has(cleanUrl)) {
              req.url = '/index.html';
            }

            next();
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use((req, res, next) => {
            const cleanUrl = (req.url?.split('?')[0] || '/').replace(/\/+$/, '') || '/';

            // Ensure X-Robots-Tag header never blocks public route indexing + add safe security headers
            res.setHeader('X-Robots-Tag', getXRobotsTagForPath(cleanUrl));
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

            if (cleanUrl === '/robots.txt') {
              const distRobotsPath = path.resolve(projectRoot, 'dist', 'robots.txt');
              const publicRobotsPath = path.resolve(projectRoot, 'public', 'robots.txt');
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.setHeader('Cache-Control', 'public, max-age=3600');
              res.statusCode = 200;
              if (fs.existsSync(distRobotsPath)) {
                fs.createReadStream(distRobotsPath).pipe(res);
              } else if (fs.existsSync(publicRobotsPath)) {
                fs.createReadStream(publicRobotsPath).pipe(res);
              } else {
                res.end(generateRobotsTxt());
              }
              return;
            }

            if (cleanUrl === '/ads.txt') {
              const adsPath = path.resolve(projectRoot, 'dist', 'ads.txt');
              if (fs.existsSync(adsPath)) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                res.statusCode = 200;
                fs.createReadStream(adsPath).pipe(res);
                return;
              }
            }

            if (cleanUrl === '/sitemap.xml') {
              const xml = buildDynamicSitemapForProject(projectRoot);
              res.setHeader('Content-Type', 'application/xml; charset=utf-8');
              res.setHeader('Cache-Control', 'public, max-age=3600');
              res.statusCode = 200;
              res.end(xml);
              return;
            }

            // Normalize relative asset/favicon URLs requested from trailing-slash sub-routes
            const assetMatch = cleanUrl.match(/^\/[^/]+(\/(?:assets|favicon[^/]*|apple-touch-icon\.png|icon-192\.png).*)$/);
            if (assetMatch) {
              req.url = assetMatch[1];
              next();
              return;
            }

            if (cleanUrl !== '/' && publicRouteSet.has(cleanUrl)) {
              req.url = '/index.html';
            }

            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('/three/') || id.includes('/@react-three/')) {
              return 'vendor-three';
            }
            if (id.includes('/firebase/') || id.includes('/@firebase/')) {
              return 'vendor-firebase';
            }
            if (id.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
            if (id.includes('/motion/') || id.includes('/framer-motion/')) {
              return 'vendor-motion';
            }
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
              return 'vendor-react';
            }
            return undefined;
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

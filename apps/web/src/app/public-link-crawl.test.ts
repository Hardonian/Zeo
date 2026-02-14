import { describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { STITCH_PANELS } from '@/lib/stitch';

const APP_ROOT = path.join(process.cwd(), 'src/app');
const PUBLIC_SHELL_PATH = path.join(process.cwd(), 'src/components/site/PublicShell.tsx');

const CRAWL_SEEDS = [
  '/',
  '/about',
  '/audit',
  '/capabilities',
  '/changelog',
  '/compare',
  '/contact',
  '/controlplane',
  '/dashboard',
  '/demo',
  '/docs',
  '/docs/github',
  '/docs/install',
  '/docs/quickstart',
  '/faq',
  '/features',
  '/github',
  '/inbox',
  '/install',
  '/intake',
  '/legal/privacy',
  '/legal/terms',
  '/login',
  '/oauth/consent',
  '/platform',
  '/policy-packs',
  '/pricing',
  '/privacy',
  '/quickstart',
  '/regimes',
  '/replay',
  '/security',
  '/signin',
  '/signup',
  '/status',
  '/stitch',
  '/support',
  '/terms',
];

function routeFromPageFile(filePath: string): string {
  const rel = path.relative(APP_ROOT, path.dirname(filePath));
  if (!rel || rel === '.') {
    return '/';
  }

  return `/${rel.replace(/\\/g, '/')}`;
}

async function listPageFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const pages: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      pages.push(...await listPageFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name === 'page.tsx') {
      pages.push(fullPath);
    }
  }

  return pages;
}

function extractInternalLinks(source: string): string[] {
  const links = new Set<string>();
  const hrefRegex = /href\s*=\s*["'`]([^"'`]+)["'`]/g;
  for (const match of source.matchAll(hrefRegex)) {
    const href = match[1].trim();
    if (!href.startsWith('/')) {
      continue;
    }

    if (href.startsWith('//') || href.startsWith('/api/')) {
      continue;
    }

    const clean = href.split('#')[0].split('?')[0];
    if (!clean) {
      continue;
    }

    links.add(clean === '/' ? clean : clean.replace(/\/$/, ''));
  }

  return Array.from(links);
}

describe('public route internal link crawl', () => {
  it('ensures seeded marketing routes do not link to unresolved app routes', async () => {
    const pageFiles = await listPageFiles(APP_ROOT);
    const staticRoutes = new Map<string, string>();

    for (const pageFile of pageFiles) {
      const route = routeFromPageFile(pageFile);
      if (route.includes('/api') || route.startsWith('/app')) {
        continue;
      }

      if (route.includes('[')) {
        continue;
      }

      staticRoutes.set(route, pageFile);
    }

    const stitchDynamicRoutes = new Set(STITCH_PANELS.map((panel) => `/stitch/${panel.slug}`));

    const shellSource = await fs.readFile(PUBLIC_SHELL_PATH, 'utf8');
    const shellLinks = extractInternalLinks(shellSource);

    const frontier = [...CRAWL_SEEDS];
    const visited = new Set<string>();
    const deadLinks = new Set<string>();

    while (frontier.length > 0) {
      const currentRoute = frontier.shift();
      if (!currentRoute || visited.has(currentRoute)) {
        continue;
      }

      visited.add(currentRoute);

      const sourcePath = staticRoutes.get(currentRoute);
      if (!sourcePath) {
        deadLinks.add(`[seed-missing] ${currentRoute}`);
        continue;
      }

      const source = await fs.readFile(sourcePath, 'utf8');
      for (const link of [...extractInternalLinks(source), ...shellLinks]) {
        const exists = staticRoutes.has(link) || stitchDynamicRoutes.has(link);
        if (!exists) {
          deadLinks.add(`${currentRoute} -> ${link}`);
          continue;
        }

        if (!visited.has(link)) {
          frontier.push(link);
        }
      }
    }

    expect(Array.from(deadLinks).sort()).toEqual([]);
    expect(visited.size).toBeGreaterThanOrEqual(CRAWL_SEEDS.length);
  });
});

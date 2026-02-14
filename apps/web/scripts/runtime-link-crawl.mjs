import { spawn } from 'node:child_process';

const BASE_URL = process.env.ZEO_LINK_CRAWL_BASE_URL || 'http://127.0.0.1:3210';
const HOST = '127.0.0.1';
const PORT = 3210;
const START_TIMEOUT_MS = 45_000;

const SEEDS = [
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
  '/stitch/decision-branching-view-1',
  '/stitch/uncertainty-ledger-viewer-1',
  '/stitch/epistemic-translator-panel-1',
  '/stitch/oss-governance-dashboard',
  '/stitch/kpi-health-monitor-1',
  '/stitch/evidence-planner',
  '/support',
  '/terms',
];

function extractInternalLinks(html) {
  const links = new Set();
  const hrefRegex = /href=["']([^"']+)["']/g;
  for (const match of html.matchAll(hrefRegex)) {
    const href = match[1].trim();
    if (!href.startsWith('/')) continue;
    if (href.startsWith('//') || href.startsWith('/api/') || href.startsWith('/_next/')) continue;

    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    links.add(clean === '/' ? clean : clean.replace(/\/$/, ''));
  }

  return [...links];
}

async function fetchRoute(route) {
  const response = await fetch(`${BASE_URL}${route}`);
  return {
    status: response.status,
    body: await response.text(),
  };
}

async function waitForServerReady() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < START_TIMEOUT_MS) {
    try {
      const response = await fetch(`${BASE_URL}/`);
      if (response.ok) return;
    } catch {
      // retry until timeout
    }

    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  throw new Error(`Timed out waiting for Next.js server at ${BASE_URL}`);
}

async function run() {
  const server = spawn('pnpm', ['exec', 'next', 'start', '-p', String(PORT), '-H', HOST], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  server.stdout.on('data', (chunk) => process.stdout.write(chunk));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));

  try {
    await waitForServerReady();

    const visited = new Set();
    const queue = [...SEEDS];
    const failures = [];

    while (queue.length > 0) {
      const route = queue.shift();
      if (!route || visited.has(route)) continue;
      visited.add(route);

      const { status, body } = await fetchRoute(route);
      if (status >= 400) {
        failures.push(`${route} -> HTTP ${status}`);
        continue;
      }

      const links = extractInternalLinks(body);
      for (const link of links) {
        if (!visited.has(link)) {
          queue.push(link);
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(`Runtime link crawl failures:\n${failures.join('\n')}`);
    }

    console.log(`Runtime crawl passed across ${visited.size} routes.`);
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!server.killed) {
      server.kill('SIGKILL');
    }
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

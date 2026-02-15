#!/usr/bin/env node

type RouteAudit = {
  path: string;
  expectNoIndex?: boolean;
  expectJsonLd?: boolean;
};

const baseUrl = (process.env.SEO_AUDIT_BASE_URL ?? 'http://127.0.0.1:3005').replace(/\/$/, '');
const routes: RouteAudit[] = [
  { path: '/', expectJsonLd: true },
  { path: '/product', expectJsonLd: true },
  { path: '/docs' },
  { path: '/pricing', expectJsonLd: true },
  { path: '/platform' },
  { path: '/app', expectNoIndex: true },
  { path: '/studio', expectNoIndex: true },
];

const failures: string[] = [];

function readMeta(html: string, attr: 'name' | 'property', value: string) {
  const match = html.match(new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'));
  return match?.[1]?.trim();
}

function hasTag(html: string, regex: RegExp) {
  return regex.test(html);
}

async function fetchText(path: string) {
  const res = await fetch(`${baseUrl}${path}`);
  const body = await res.text();
  return { res, body };
}

for (const route of routes) {
  const { res, body } = await fetchText(route.path);
  if (!res.ok) {
    failures.push(`${route.path}: expected 200 but got ${res.status}`);
    continue;
  }

  const title = body.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  if (!title || /^zeo$/i.test(title)) failures.push(`${route.path}: missing/weak <title>`);

  if (!readMeta(body, 'name', 'description')) failures.push(`${route.path}: missing meta description`);
  if (!hasTag(body, /<link[^>]*rel=["']canonical["'][^>]*>/i)) failures.push(`${route.path}: missing canonical`);
  if (!readMeta(body, 'property', 'og:title')) failures.push(`${route.path}: missing og:title`);
  if (!readMeta(body, 'property', 'og:description')) failures.push(`${route.path}: missing og:description`);
  if (!readMeta(body, 'name', 'twitter:card')) failures.push(`${route.path}: missing twitter:card`);

  const robots = readMeta(body, 'name', 'robots')?.toLowerCase() ?? '';
  if (route.expectNoIndex) {
    if (!robots.includes('noindex')) failures.push(`${route.path}: expected noindex robots directive`);
  } else if (robots.includes('noindex')) {
    failures.push(`${route.path}: expected indexable route but found noindex`);
  }

  if (route.expectJsonLd && !hasTag(body, /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i)) {
    failures.push(`${route.path}: missing JSON-LD script`);
  }
}

const { res: sitemapRes, body: sitemapBody } = await fetchText('/sitemap.xml');
if (!sitemapRes.ok) {
  failures.push(`/sitemap.xml missing (status ${sitemapRes.status})`);
} else {
  for (const blocked of ['/app', '/studio', '/api']) {
    if (sitemapBody.includes(blocked)) {
      failures.push(`/sitemap.xml includes private route prefix ${blocked}`);
    }
  }
}

const { res: robotsRes, body: robotsBody } = await fetchText('/robots.txt');
if (!robotsRes.ok) {
  failures.push(`/robots.txt missing (status ${robotsRes.status})`);
} else {
  for (const disallow of ['/app', '/studio', '/api']) {
    if (!robotsBody.includes(`Disallow: ${disallow}`)) {
      failures.push(`/robots.txt missing Disallow: ${disallow}`);
    }
  }
}

if (failures.length > 0) {
  console.error('SEO audit failed:');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`SEO audit passed for ${routes.length} routes at ${baseUrl}`);

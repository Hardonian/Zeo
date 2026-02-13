import { headers } from 'next/headers';

const PUBLIC_ROUTES = [
  '/',
  '/platform',
  '/install',
  '/github',
  '/support',
  '/docs',
  '/docs/install',
  '/docs/quickstart',
  '/docs/github',
  '/pricing',
  '/features',
  '/security',
  '/about',
  '/faq',
  '/contact',
  '/privacy',
  '/terms',
  '/legal/privacy',
  '/legal/terms',
  '/status',
  '/changelog',
];

export async function GET() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000';
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;
  const now = new Date().toISOString();
  const urls = PUBLIC_ROUTES.map((route) => `\n  <url><loc>${baseUrl}${route}</loc><lastmod>${now}</lastmod></url>`).join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

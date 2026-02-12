const PUBLIC_ROUTES = ['/', '/about', '/contact', '/pricing', '/privacy', '/terms', '/platform', '/stitch', '/quickstart', '/demo'];

export function GET() {
  const now = new Date().toISOString();
  const urls = PUBLIC_ROUTES.map((route) => `\n  <url><loc>http://localhost:3000${route}</loc><lastmod>${now}</lastmod></url>`).join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

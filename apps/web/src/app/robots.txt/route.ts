export function GET() {
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /dashboard\nSitemap: http://localhost:3000/sitemap.xml\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

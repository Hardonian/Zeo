import { siteMetadataBase } from '@/lib/seo/metadata';

const INDEXABLE_ROUTES = [
  '/',
  '/product',
  '/platform',
  '/docs',
  '/pricing',
  '/about',
  '/support',
  '/features',
  '/faq',
  '/contact',
];

export default function sitemap() {
  const base = siteMetadataBase();
  const now = new Date();

  return INDEXABLE_ROUTES.map((path) => ({
    url: `${base.origin}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}

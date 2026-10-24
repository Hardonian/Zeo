import { siteMetadataBase } from '@/lib/seo/metadata';

export default function robots() {
  const base = siteMetadataBase();
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/docs', '/pricing', '/platform', '/product'],
        disallow: ['/api/', '/app/', '/studio/', '/dashboard/', '/auth/', '/controlplane'],
      },
    ],
    sitemap: `${base.origin}/sitemap.xml`,
  };
}

import type { Metadata } from 'next';
import './globals.css';
import { buildMetadata } from '@/lib/seo/metadata';

export const icons = {
  icon: [
    { url: '/favicon.svg', type: 'image/svg+xml' },
    { url: '/brand/zeo/favicon.png', type: 'image/png', sizes: '512x512' },
  ],
  apple: [{ url: '/brand/zeo/favicon.png', sizes: '512x512' }],
};

export const metadata: Metadata = buildMetadata({
  title: 'Zeo — Governance and Evidence for Uncertain Decisions',
  description:
    'Zeo helps teams evaluate decisions with confidence ranges, assumptions, provenance, and sensitivity tracking.',
  canonicalPath: '/',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-blue-700 focus:shadow"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

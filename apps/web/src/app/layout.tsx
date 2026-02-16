import type { Metadata } from 'next';
import './globals.css';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Governance and Evidence for Uncertain Decisions',
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
      <head></head>
      <body className="min-h-screen bg-background text-foreground antialiased">
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

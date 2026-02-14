import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  title: 'Zeo — Governance and Evidence for Uncertain Decisions',
  description: 'Zeo helps teams evaluate decisions with confidence ranges, assumptions, provenance, and sensitivity tracking.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zeo.dev'),
  openGraph: {
    type: 'website',
    siteName: 'Zeo',
    title: 'Zeo — Governance and Evidence for Uncertain Decisions',
    description: 'Confidence ranges, assumptions, provenance, and sensitivity tracking for deterministic decision governance.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Zeo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zeo — Governance and Evidence for Uncertain Decisions',
    description: 'Confidence ranges, assumptions, provenance, and sensitivity tracking for deterministic decision governance.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}

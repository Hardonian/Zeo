import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  title: 'Zeo',
  description: 'Static-first Zeo site for marketing, docs, onboarding, and support.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}

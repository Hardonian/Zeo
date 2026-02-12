import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zeo',
  description: 'Static-first public site and dashboard shell for Zeo.',
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

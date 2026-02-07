import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zeo - Edge UI Shell',
  description: 'Edge-first web UI with plugin-style Panel Host for Zeo',
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

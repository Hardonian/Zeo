import Link from 'next/link';
import type { ReactNode } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/platform', label: 'Platform' },
  { href: '/stitch', label: 'Stitch Pages' },
  { href: '/contact', label: 'Contact' },
];

export function PublicShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-blue-700">Zeo</Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-gray-700 hover:text-blue-700">
                {link.label}
              </Link>
            ))}
            <Link href="/dashboard" className="rounded border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-50">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-semibold">{title}</h1>
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-gray-600">
          <span>Confidence range, assumptions, provenance, and sensitivity first.</span>
          <div className="flex gap-3">
            <Link href="/privacy" className="hover:text-blue-700">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-700">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

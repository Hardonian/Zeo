'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

const HEADER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/platform', label: 'Product' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/install', label: 'Install' },
  { href: '/github', label: 'GitHub Connect' },
  { href: '/docs', label: 'Docs' },
  { href: '/about', label: 'About' },
  { href: '/support', label: 'Support' },
];

const FOOTER_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/platform', label: 'Product' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/install', label: 'Install' },
  { href: '/github', label: 'GitHub Connect' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/status', label: 'Status' },
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/support', label: 'Support' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = isActive(pathname, href);

  return (
    <Link href={href} className={`text-sm transition-colors ${active ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-700'}`}>
      {label}
    </Link>
  );
}

export function PublicShell({ title, children }: { title: string; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    setPathname(window.location.pathname || '/');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-blue-700 focus:shadow">
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-blue-700">Zeo</Link>
            <button type="button" aria-expanded={mobileOpen} aria-controls="mobile-nav" className="rounded border border-gray-300 px-3 py-1 text-sm md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" onClick={() => setMobileOpen((open) => !open)}>
              Menu
            </button>
            <nav className="hidden items-center gap-4 md:flex">
              {HEADER_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
              <a href="https://github.com/scott/zeo" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-blue-700">GitHub</a>
              <Link href="/signin" className="text-sm text-gray-700 hover:text-blue-700">Sign In</Link>
              <Link href="/docs/quickstart" className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                Get Started
              </Link>
            </nav>
          </div>
          {mobileOpen ? (
            <nav id="mobile-nav" className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3 md:hidden">
              {HEADER_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
              <a href="https://github.com/scott/zeo" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-blue-700">
                GitHub
              </a>
              <Link href="/login" className="text-sm text-gray-700 hover:text-blue-700">Sign In</Link>
              <Link href="/docs/quickstart" className="rounded bg-blue-600 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-blue-700">
                Get Started
              </Link>
            </nav>
          ) : null}
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-semibold">{title}</h1>
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-5 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
          <span>Confidence range, assumptions, provenance, and sensitivity first.</span>
          <div className="flex flex-wrap gap-3">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-blue-700">{link.label}</Link>
            ))}
            <a href="https://github.com/scott/zeo" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

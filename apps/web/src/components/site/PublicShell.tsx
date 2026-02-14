'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ZeoMark, IconGitHub } from '@/components/icons/ZeoIcons';
import { GITHUB_REPO_URL, OAUTH_CONSENT_URL } from '@/content/site';

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
    <Link href={href} className={`text-sm transition-colors ${active ? 'text-blue-700 font-semibold' : 'text-gray-600 hover:text-blue-700'}`}>
      {label}
    </Link>
  );
}

export function PublicShell({ title, children, hero }: { title: string; children: ReactNode; hero?: boolean }) {
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

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto w-full max-w-6xl px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Zeo home">
              <ZeoMark className="h-7 w-7 transition-transform group-hover:scale-105" />
              <span className="text-lg font-bold tracking-tight text-gray-900">Zeo</span>
            </Link>
            <button type="button" aria-expanded={mobileOpen} aria-controls="mobile-nav" className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 hover:bg-gray-50" onClick={() => setMobileOpen((open) => !open)}>
              Menu
            </button>
            <nav className="hidden items-center gap-5 md:flex">
              {HEADER_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors" aria-label="GitHub">
                <IconGitHub className="h-5 w-5" />
              </a>
              <a href={OAUTH_CONSENT_URL} className="text-sm text-gray-600 hover:text-blue-700">Sign In</a>
              <Link href="/docs/quickstart" className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all hover:from-blue-700 hover:to-indigo-700">
                Get Started
              </Link>
            </nav>
          </div>
          {mobileOpen ? (
            <nav id="mobile-nav" className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3 md:hidden">
              {HEADER_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700">
                <IconGitHub className="h-4 w-4" />
                GitHub
              </a>
              <a href={OAUTH_CONSENT_URL} className="text-sm text-gray-600 hover:text-blue-700">Sign In</a>
              <Link href="/docs/quickstart" className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-center text-sm font-medium text-white">
                Get Started
              </Link>
            </nav>
          ) : null}
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="mx-auto w-full max-w-6xl px-6 py-10">
        {hero ? null : (
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-2">
              <Link href="/" className="flex items-center gap-2" aria-label="Zeo home">
                <ZeoMark className="h-6 w-6" />
                <span className="font-bold text-gray-900">Zeo</span>
              </Link>
              <p className="text-sm text-gray-500 max-w-xs">
                Confidence ranges, assumptions, provenance, and sensitivity first.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-blue-700 transition-colors">{link.label}</Link>
              ))}
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors">GitHub</a>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
            MIT License. Open source.
          </div>
        </div>
      </footer>
    </div>
  );
}

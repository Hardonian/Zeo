'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ZeoMark, IconGitHub } from '@/components/icons/ZeoIcons';
import { GITHUB_REPO_URL, OAUTH_CONSENT_URL } from '@/content/site';
import { uiTokens } from '@/components/site/ui-system';

const HEADER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/platform', label: 'Platform' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/quickstart', label: 'Quickstart' },
  { href: '/about', label: 'About' },
  { href: '/support', label: 'Support' },
];

const FOOTER_LINKS = [
  { href: '/platform', label: 'Platform' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/install', label: 'Install' },
  { href: '/docs', label: 'Docs' },
  { href: '/status', label: 'Status' },
  { href: '/security', label: 'Security' },
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
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
    <Link
      href={href}
      className={`rounded-md px-1.5 py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${active ? 'font-semibold text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}
    >
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-blue-700 focus:shadow"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className={`${uiTokens.container} py-3`}>
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="Zeo home">
              <ZeoMark className="h-7 w-7 transition-transform group-hover:scale-105" />
              <span className="text-lg font-semibold tracking-tight text-slate-900">Zeo</span>
            </Link>
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 hover:bg-slate-50"
              onClick={() => setMobileOpen((open) => !open)}
            >
              Menu
            </button>
            <nav className="hidden items-center gap-3 md:flex" aria-label="Primary">
              {HEADER_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-slate-500 transition-colors hover:text-slate-900" aria-label="GitHub repository">
                <IconGitHub className="h-5 w-5" />
              </a>
              <a href={OAUTH_CONSENT_URL} className="text-sm text-slate-600 hover:text-blue-700">Sign In</a>
              <Link href="/docs/quickstart" className={uiTokens.buttonPrimary}>Get Started</Link>
            </nav>
          </div>
          {mobileOpen ? (
            <nav id="mobile-nav" className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 md:hidden" aria-label="Mobile primary">
              {HEADER_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700">
                <IconGitHub className="h-4 w-4" />
                GitHub
              </a>
              <a href={OAUTH_CONSENT_URL} className="text-sm text-slate-600 hover:text-blue-700">Sign In</a>
              <Link href="/docs/quickstart" className={uiTokens.buttonPrimary}>Get Started</Link>
            </nav>
          ) : null}
        </div>
      </header>

      <main id="main-content" className={`${uiTokens.container} py-10 md:py-12`}>
        {hero ? null : <h1 className="mb-8 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>}
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className={`${uiTokens.container} py-8`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex max-w-xs flex-col gap-2">
              <Link href="/" className="flex items-center gap-2" aria-label="Zeo home">
                <ZeoMark className="h-6 w-6" />
                <span className="font-semibold text-slate-900">Zeo</span>
              </Link>
              <p className="text-sm text-slate-500">Confidence ranges, assumptions, provenance, and sensitivity first.</p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500" aria-label="Footer">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-blue-700">{link.label}</Link>
              ))}
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-700">GitHub</a>
            </nav>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">MIT License. Open source.</div>
        </div>
      </footer>
    </div>
  );
}

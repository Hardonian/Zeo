'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ZeoMark, IconGitHub } from '@/components/icons/ZeoIcons';
import { ButtonLink } from '@/components/ui';
import { GITHUB_REPO_URL, OAUTH_CONSENT_URL } from '@/content/site';

const HEADER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/platform', label: 'Product' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/install', label: 'Install' },
];

const FOOTER_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/install', label: 'Install' },
  { href: '/status', label: 'Status' },
  { href: '/support', label: 'Support' },
  { href: '/contact', label: 'Contact' },
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
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
    <Link href={href} className={`text-sm font-medium transition-colors ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
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
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-blue-700 focus:shadow">
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto w-full max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Zeo home">
              <ZeoMark className="h-7 w-7 transition-transform group-hover:scale-105" />
              <span className="text-lg font-bold tracking-tight text-foreground">Zeo</span>
            </Link>
            <button type="button" aria-expanded={mobileOpen} aria-controls="mobile-nav" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground" onClick={() => setMobileOpen((open) => !open)}>
              Menu
            </button>
            <nav className="hidden items-center gap-5 md:flex">
              {HEADER_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
              <ButtonLink href={GITHUB_REPO_URL} external aria-label="GitHub" variant="ghost" size="sm" className="h-9 w-9 px-0">
                <IconGitHub className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href={OAUTH_CONSENT_URL} variant="ghost" size="sm">
                Sign In
              </ButtonLink>
              <ButtonLink href="/docs/quickstart" variant="primary" size="sm">
                Get Started
              </ButtonLink>
            </nav>
          </div>
          {mobileOpen ? (
            <nav id="mobile-nav" className="mt-3 flex flex-col gap-3 border-t border-border/60 pt-3 md:hidden">
              {HEADER_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <IconGitHub className="h-4 w-4" />
                GitHub
              </a>
              <ButtonLink href={OAUTH_CONSENT_URL} variant="ghost" size="sm" className="justify-start">
                Sign In
              </ButtonLink>
              <ButtonLink href="/docs/quickstart" variant="primary" size="sm" className="justify-center">
                Get Started
              </ButtonLink>
            </nav>
          ) : null}
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
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
                <span className="font-bold text-foreground">Zeo</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                Confidence ranges, assumptions, provenance, and sensitivity first.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-foreground transition-colors">{link.label}</Link>
              ))}
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
          <div className="mt-6 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            MIT License. Open source.
          </div>
        </div>
      </footer>
    </div>
  );
}

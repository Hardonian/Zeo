import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface CSPConfig {
  scriptSrc: string[];
  styleSrc: string[];
  connectSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
  frameSrc: string[];
  frameAncestors: string[];
  baseUri: string[];
  formAction: string[];
}

const DEFAULT_CSP: CSPConfig = {
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  connectSrc: ["'self'"],
  imgSrc: ["'self'", 'data:', 'blob:'],
  fontSrc: ["'self'"],
  frameSrc: ["'self'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
};

const PROTECTED_PREFIXES = ['/app', '/dashboard', '/audit', '/controlplane', '/inbox', '/intake', '/policy-packs', '/regimes', '/replay'];

function generateCSPHeader(config: CSPConfig): string {
  const directives = [
    `default-src 'self'`,
    `script-src ${config.scriptSrc.join(' ')}`,
    `style-src ${config.styleSrc.join(' ')}`,
    `connect-src ${config.connectSrc.join(' ')}`,
    `img-src ${config.imgSrc.join(' ')}`,
    `font-src ${config.fontSrc.join(' ')}`,
    `frame-src ${config.frameSrc.join(' ')}`,
    `frame-ancestors ${config.frameAncestors.join(' ')}`,
    `base-uri ${config.baseUri.join(' ')}`,
    `form-action ${config.formAction.join(' ')}`,
    'upgrade-insecure-requests',
  ];

  return directives.join('; ');
}

function isPanelRoute(pathname: string): boolean {
  return pathname.startsWith('/demo') || pathname.startsWith('/panels/') || pathname.includes('/panel-');
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !request.cookies.get('zeo_session')?.value) {
    const signInUrl = new URL('/login', request.url);
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  let cspConfig: CSPConfig = { ...DEFAULT_CSP };

  if (isPanelRoute(pathname)) {
    cspConfig = {
      ...cspConfig,
      scriptSrc: ["'self'"],
      frameSrc: ["'self'"],
    };
  }

  const panelDomains = request.headers.get('x-panel-allowed-domains');
  if (panelDomains) {
    try {
      const domains = JSON.parse(panelDomains) as string[];
      cspConfig.connectSrc = [...cspConfig.connectSrc, ...domains];
    } catch {
      // ignore malformed optional header
    }
  }

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', generateCSPHeader(cspConfig));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), clipboard-write=(), clipboard-read=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  if (pathname.startsWith('/panels/iframe/')) {
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};

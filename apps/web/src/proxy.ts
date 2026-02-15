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
  connectSrc: ["'self'", 'https:'],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
  fontSrc: ["'self'", 'data:'],
  frameSrc: ["'self'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
};

const PROTECTED_PREFIXES = ['/app', '/dashboard', '/audit', '/controlplane', '/inbox', '/intake', '/policy-packs', '/regimes', '/replay'];
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

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

  const reportUri = process.env.CSP_REPORT_URI?.trim();
  if (reportUri) directives.push(`report-uri ${reportUri}`);

  return directives.join('; ');
}

function isPanelRoute(pathname: string): boolean {
  return pathname.startsWith('/demo') || pathname.startsWith('/panels/') || pathname.includes('/panel-');
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isSensitiveApiPath(pathname: string) {
  return pathname.startsWith('/api/auth/') || pathname.startsWith('/api/app/keys') || pathname.startsWith('/api/approvals');
}

function shouldCheckApiOrigin(pathname: string) {
  return pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks/');
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return 'unknown';
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (!SAFE_METHODS.has(request.method) && shouldCheckApiOrigin(pathname)) {
    const origin = request.headers.get('origin');
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
    }
  }

  if (isSensitiveApiPath(pathname)) {
    const key = `${getClientIp(request)}:${pathname}`;
    if (!checkRateLimit(key)) {
      return NextResponse.json({ ok: false, error: 'Rate limit exceeded. Try again shortly.' }, { status: 429 });
    }
  }

  if (isProtectedPath(pathname) && !request.cookies.get('zeo_session')?.value) {
    const signInUrl = new URL('/login', request.url);
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  let cspConfig: CSPConfig = { ...DEFAULT_CSP };
  if (isPanelRoute(pathname)) {
    cspConfig = { ...cspConfig, scriptSrc: ["'self'"], frameSrc: ["'self'"] };
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
  const cspMode = process.env.CSP_MODE === 'enforce' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only';
  response.headers.set(cspMode, generateCSPHeader(cspConfig));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), clipboard-write=(), clipboard-read=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  if (pathname.startsWith('/panels/iframe/')) {
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

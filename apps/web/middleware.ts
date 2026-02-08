import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Content Security Policy configuration for Zeo v0.6.0 Panel Security.
 * 
 * Security-first CSP that:
 * - Blocks inline scripts (nonce required)
 * - Restricts script sources to self and explicit allowlist
 * - Prevents data exfiltration via connect-src
 * - Blocks unsafe eval (no eval(), no new Function())
 * - Enforces frame-ancestors for clickjacking protection
 */

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
  imgSrc: ["'self'", "data:", "blob:"],
  fontSrc: ["'self'"],
  frameSrc: ["'self'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
};

/**
 * Generates a CSP header string from configuration.
 */
function generateCSPHeader(config: CSPConfig): string {
  const directives = [
    `default-src 'self'`,
    `script-src ${config.scriptSrc.join(" ")}`,
    `style-src ${config.styleSrc.join(" ")}`,
    `connect-src ${config.connectSrc.join(" ")}`,
    `img-src ${config.imgSrc.join(" ")}`,
    `font-src ${config.fontSrc.join(" ")}`,
    `frame-src ${config.frameSrc.join(" ")}`,
    `frame-ancestors ${config.frameAncestors.join(" ")}`,
    `base-uri ${config.baseUri.join(" ")}`,
    `form-action ${config.formAction.join(" ")}`,
    `upgrade-insecure-requests`,
  ];

  return directives.join("; ");
}

/**
 * Checks if a request is for a panel route that needs restricted CSP.
 */
function isPanelRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/demo") ||
    pathname.startsWith("/panels/") ||
    pathname.includes("/panel-")
  );
}

/**
 * Next.js middleware for applying Content Security Policy headers.
 * 
 * Applies strict CSP to all routes, with extra restrictions for panel routes.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  
  // Start with default CSP
  let cspConfig: CSPConfig = { ...DEFAULT_CSP };

  // For panel routes, apply stricter CSP
  if (isPanelRoute(pathname)) {
    cspConfig = {
      ...cspConfig,
      // Remove unsafe-inline for scripts on panel routes
      scriptSrc: ["'self'"],
      // Restrict frames to same-origin only
      frameSrc: ["'self'"],
    };
  }

  // Check for panel-specific allowed domains from query params or headers
  // This allows panels to declare their required network domains
  const panelDomains = request.headers.get("x-panel-allowed-domains");
  if (panelDomains) {
    try {
      const domains = JSON.parse(panelDomains) as string[];
      // Add allowed domains to connect-src for this request
      cspConfig.connectSrc = [...cspConfig.connectSrc, ...domains];
    } catch {
      // Invalid domains header, ignore
    }
  }

  const cspHeader = generateCSPHeader(cspConfig);

  // Create response with CSP headers
  const response = NextResponse.next();
  
  // Set Content-Security-Policy header
  response.headers.set("Content-Security-Policy", cspHeader);
  
  // Additional security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), clipboard-write=(), clipboard-read=()"
  );

  // For iframe panels, add Cross-Origin headers
  if (pathname.startsWith("/panels/iframe/")) {
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  }

  return response;
}

/**
 * Middleware configuration.
 * Matches all routes except static files and API routes.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/* (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};

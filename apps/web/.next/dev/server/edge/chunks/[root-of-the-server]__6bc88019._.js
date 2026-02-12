(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__6bc88019._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/Documents/GitHub/Zeo/apps/web/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$Zeo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$18$2e$_drwo7e3nbewplwbna44z7xdfwa$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/Zeo/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_@playwright+test@1.58.2_react-dom@18._drwo7e3nbewplwbna44z7xdfwa/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$Zeo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$18$2e$_drwo7e3nbewplwbna44z7xdfwa$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/Zeo/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@opentelemetry+api@1.9.0_@playwright+test@1.58.2_react-dom@18._drwo7e3nbewplwbna44z7xdfwa/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
const DEFAULT_CSP = {
    scriptSrc: [
        "'self'",
        "'unsafe-inline'"
    ],
    styleSrc: [
        "'self'",
        "'unsafe-inline'"
    ],
    connectSrc: [
        "'self'"
    ],
    imgSrc: [
        "'self'",
        "data:",
        "blob:"
    ],
    fontSrc: [
        "'self'"
    ],
    frameSrc: [
        "'self'"
    ],
    frameAncestors: [
        "'none'"
    ],
    baseUri: [
        "'self'"
    ],
    formAction: [
        "'self'"
    ]
};
/**
 * Generates a CSP header string from configuration.
 */ function generateCSPHeader(config) {
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
        `upgrade-insecure-requests`
    ];
    return directives.join("; ");
}
/**
 * Checks if a request is for a panel route that needs restricted CSP.
 */ function isPanelRoute(pathname) {
    return pathname.startsWith("/demo") || pathname.startsWith("/panels/") || pathname.includes("/panel-");
}
function middleware(request) {
    const { pathname } = request.nextUrl;
    // Start with default CSP
    let cspConfig = {
        ...DEFAULT_CSP
    };
    // For panel routes, apply stricter CSP
    if (isPanelRoute(pathname)) {
        cspConfig = {
            ...cspConfig,
            // Remove unsafe-inline for scripts on panel routes
            scriptSrc: [
                "'self'"
            ],
            // Restrict frames to same-origin only
            frameSrc: [
                "'self'"
            ]
        };
    }
    // Check for panel-specific allowed domains from query params or headers
    // This allows panels to declare their required network domains
    const panelDomains = request.headers.get("x-panel-allowed-domains");
    if (panelDomains) {
        try {
            const domains = JSON.parse(panelDomains);
            // Add allowed domains to connect-src for this request
            cspConfig.connectSrc = [
                ...cspConfig.connectSrc,
                ...domains
            ];
        } catch  {
        // Invalid domains header, ignore
        }
    }
    const cspHeader = generateCSPHeader(cspConfig);
    // Create response with CSP headers
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$Zeo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$18$2e$_drwo7e3nbewplwbna44z7xdfwa$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    // Set Content-Security-Policy header
    response.headers.set("Content-Security-Policy", cspHeader);
    // Additional security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), clipboard-write=(), clipboard-read=()");
    // For iframe panels, add Cross-Origin headers
    if (pathname.startsWith("/panels/iframe/")) {
        response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
        response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
        response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    }
    return response;
}
const config = {
    matcher: [
        /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/* (API routes)
     */ "/((?!_next/static|_next/image|favicon.ico|api/).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__6bc88019._.js.map
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');


function resolveWorkspaceEntry(distPath, srcPath) {
  return fs.existsSync(distPath) ? distPath : srcPath;
}

function buildCspValue() {
  const mode = process.env.CSP_MODE === 'enforce' ? 'enforce' : 'report-only';
  const reportUri = process.env.CSP_REPORT_URI?.trim();
  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  if (isDev) {
    scriptSrc.push("'unsafe-eval'");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];

  if (reportUri) {
    directives.push(`report-uri ${reportUri}`);
  }

  return { mode, value: directives.join('; ') };
}

function buildSecurityHeaders() {
  const { mode, value } = buildCspValue();
  const headers = [
    { key: mode === 'enforce' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only', value },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  ];

  if (process.env.NODE_ENV === 'production') {
    headers.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' });
  }

  return headers;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],

  // Turbopack root configuration to silence workspace root warning
  // NOTE: Webpack is still used due to complex workspace package redirects
  turbopack: {
    root: rootDir,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Ensure all pages are statically generated at build time
  output: 'standalone',

  // Generate all static pages - don't bail out to client-side rendering
  staticPageGenerationTimeout: 120,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: buildSecurityHeaders(),
      },
    ];
  },

  webpack: (config, { isServer, webpack }) => {
    // Use NormalModuleReplacementPlugin to forcibly redirect workspace imports
    const workspaceRedirects = [
      { from: /^@zeo\/contracts$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/contracts/dist/index.js'), path.join(rootDir, 'packages/contracts/src/index.ts')) },
      { from: /^@zeo\/kernel$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/kernel/dist/index.js'), path.join(rootDir, 'packages/kernel/src/index.ts')) },
      { from: /^@zeo\/env$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/env/dist/index.js'), path.join(rootDir, 'packages/env/src/index.ts')) },
      { from: /^@zeo\/studio-server$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/studio-server/dist/index.js'), path.join(rootDir, 'packages/studio-server/src/index.ts')) },
      { from: /^@zeo\/core$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/core/dist/index.js'), path.join(rootDir, 'packages/core/src/index.ts')) },
      { from: /^@zeo\/core\/client$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/core/dist/client.js'), path.join(rootDir, 'packages/core/src/client.ts')) },
      { from: /^@zeo\/reality$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/reality/dist/index.js'), path.join(rootDir, 'packages/reality/src/index.ts')) },
      { from: /^@zeo\/radar$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/radar/dist/index.js'), path.join(rootDir, 'packages/radar/src/index.ts')) },
      { from: /^@zeo\/telemetry$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/telemetry/dist/index.js'), path.join(rootDir, 'packages/telemetry/src/index.ts')) },
      { from: /^@zeo\/governance$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/governance/dist/index.js'), path.join(rootDir, 'packages/governance/src/index.ts')) },
      { from: /^@zeo\/signal-discovery$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/signal-discovery/dist/index.js'), path.join(rootDir, 'packages/signal-discovery/src/index.ts')) },
      { from: /^@zeo\/kpi$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/kpi/dist/index.js'), path.join(rootDir, 'packages/kpi/src/index.ts')) },
      { from: /^@zeo\/warehouse$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/warehouse/dist/index.js'), path.join(rootDir, 'packages/warehouse/src/index.ts')) },
      { from: /^@zeo\/repro-pack$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/repro-pack/dist/index.js'), path.join(rootDir, 'packages/repro-pack/src/index.ts')) },
      { from: /^@zeo\/policy$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/policy/dist/index.js'), path.join(rootDir, 'packages/policy/src/index.ts')) },
      { from: /^@zeo\/analysis$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/analysis/dist/index.js'), path.join(rootDir, 'packages/analysis/src/index.ts')) },
      { from: /^@zeo\/jobs$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/jobs/dist/index.js'), path.join(rootDir, 'packages/jobs/src/index.ts')) },
      { from: /^@zeo\/id$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/id/dist/index.js'), path.join(rootDir, 'packages/id/src/index.ts')) },
      { from: /^@zeo\/counterfactuals$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/counterfactuals/dist/index.js'), path.join(rootDir, 'packages/counterfactuals/src/index.ts')) },
      { from: /^@zeo\/budgets$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/budgets/dist/index.js'), path.join(rootDir, 'packages/budgets/src/index.ts')) },
      { from: /^@zeo\/nl$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/nl/dist/index.js'), path.join(rootDir, 'packages/nl/src/index.ts')) },
      { from: /^@zeo\/regimes$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/regimes/dist/index.js'), path.join(rootDir, 'packages/regimes/src/index.ts')) },
      { from: /^@zeo\/trust$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/trust/dist/index.js'), path.join(rootDir, 'packages/trust/src/index.ts')) },
      { from: /^@zeo\/memory$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/memory/dist/index.js'), path.join(rootDir, 'packages/memory/src/index.ts')) },
      { from: /^@zeo\/eval$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/eval/dist/index.js'), path.join(rootDir, 'packages/eval/src/index.ts')) },
      { from: /^@zeo\/db$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/db/dist/index.js'), path.join(rootDir, 'packages/db/src/index.ts')) },
      { from: /^@zeo\/compliance$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/compliance/dist/index.js'), path.join(rootDir, 'packages/compliance/src/index.ts')) },
      { from: /^@zeo\/modules$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/modules/dist/index.js'), path.join(rootDir, 'packages/modules/src/index.ts')) },
      { from: /^@zeo\/observability$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/observability/dist/index.js'), path.join(rootDir, 'packages/observability/src/index.ts')) },
      { from: /^@zeo\/optimization$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/optimization/dist/index.js'), path.join(rootDir, 'packages/optimization/src/index.ts')) },
      { from: /^@zeo\/schema-registry$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/schema-registry/dist/index.js'), path.join(rootDir, 'packages/schema-registry/src/index.ts')) },
      { from: /^@zeo\/simulation$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/simulation/dist/index.js'), path.join(rootDir, 'packages/simulation/src/index.ts')) },
      { from: /^@zeo\/tenant$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/tenant/dist/index.js'), path.join(rootDir, 'packages/tenant/src/index.ts')) },
    ];

    workspaceRedirects.forEach(({ from, to }) => {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(from, (resource) => {
          resource.request = to;
        })
      );
    });

    // Also set up aliases as fallback
    workspaceRedirects.forEach(({ from, to }) => {
      const key = from.source.replace(/\$/g, '').replace(/\\/g, '');
      config.resolve.alias[key] = to;
    });

    // Handle ESM imports with .js extension in TS files
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };

    // Server-only packages
    if (!isServer) {
      const serverOnlyPackages = [
        '@zeo/rsl', '@zeo/timeseries', '@zeo/models',
        'child_process', 'fs', 'fs/promises', 'path', 'url',
        'node:crypto', 'node:buffer', 'better-sqlite3', 'adm-zip', 'bindings'
      ];
      serverOnlyPackages.forEach(pkg => {
        config.resolve.alias[pkg] = false;
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            new RegExp(`^${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
            (resource) => {
              resource.request = 'data:text/javascript,export default {}';
            }
          )
        );
      });
    }

    return config;
  },
};

export default nextConfig;

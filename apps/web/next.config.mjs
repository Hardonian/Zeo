import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');


function resolveWorkspaceEntry(distPath, srcPath) {
  return fs.existsSync(distPath) ? distPath : srcPath;
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
  
  webpack: (config, { isServer, defaultLoaders, webpack }) => {
    // Use NormalModuleReplacementPlugin to forcibly redirect workspace imports
    const workspaceRedirects = [
      { from: /^@zeo\/contracts$/, to: resolveWorkspaceEntry(path.join(rootDir, 'packages/contracts/dist/index.js'), path.join(rootDir, 'packages/contracts/src/index.ts')) },
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

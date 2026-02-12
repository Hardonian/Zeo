import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

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
      { from: /^@zeo\/contracts$/, to: path.join(rootDir, 'packages/contracts/dist/index.js') },
      { from: /^@zeo\/core$/, to: path.join(rootDir, 'packages/core/dist/index.js') },
      { from: /^@zeo\/core\/client$/, to: path.join(rootDir, 'packages/core/dist/client.js') },
      { from: /^@zeo\/reality$/, to: path.join(rootDir, 'packages/reality/dist/index.js') },
      { from: /^@zeo\/radar$/, to: path.join(rootDir, 'packages/radar/dist/index.js') },
      { from: /^@zeo\/telemetry$/, to: path.join(rootDir, 'packages/telemetry/dist/index.js') },
      { from: /^@zeo\/governance$/, to: path.join(rootDir, 'packages/governance/dist/index.js') },
      { from: /^@zeo\/signal-discovery$/, to: path.join(rootDir, 'packages/signal-discovery/dist/index.js') },
      { from: /^@zeo\/kpi$/, to: path.join(rootDir, 'packages/kpi/dist/index.js') },
      { from: /^@zeo\/warehouse$/, to: path.join(rootDir, 'packages/warehouse/dist/index.js') },
      { from: /^@zeo\/repro-pack$/, to: path.join(rootDir, 'packages/repro-pack/dist/index.js') },
      { from: /^@zeo\/policy$/, to: path.join(rootDir, 'packages/policy/dist/index.js') },
      { from: /^@zeo\/analysis$/, to: path.join(rootDir, 'packages/analysis/dist/index.js') },
      { from: /^@zeo\/jobs$/, to: path.join(rootDir, 'packages/jobs/dist/index.js') },
      { from: /^@zeo\/id$/, to: path.join(rootDir, 'packages/id/dist/index.js') },
      { from: /^@zeo\/counterfactuals$/, to: path.join(rootDir, 'packages/counterfactuals/dist/index.js') },
      { from: /^@zeo\/budgets$/, to: path.join(rootDir, 'packages/budgets/dist/index.js') },
      { from: /^@zeo\/nl$/, to: path.join(rootDir, 'packages/nl/dist/index.js') },
      { from: /^@zeo\/regimes$/, to: path.join(rootDir, 'packages/regimes/dist/index.js') },
      { from: /^@zeo\/trust$/, to: path.join(rootDir, 'packages/trust/dist/index.js') },
      { from: /^@zeo\/memory$/, to: path.join(rootDir, 'packages/memory/dist/index.js') },
      { from: /^@zeo\/eval$/, to: path.join(rootDir, 'packages/eval/dist/index.js') },
      { from: /^@zeo\/db$/, to: path.join(rootDir, 'packages/db/dist/index.js') },
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

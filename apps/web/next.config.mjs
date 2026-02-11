import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
  transpilePackages: [
    '@zeo/contracts',
    '@zeo/core',
    '@zeo/reality',
    '@zeo/radar',
    '@zeo/telemetry',
    '@zeo/governance',
    '@zeo/signal-discovery',
    '@zeo/kpi',
    '@zeo/warehouse',
    '@zeo/repro-pack',
    '@zeo/policy',
    '@zeo/analysis'
  ],
  turbopack: {
    root: '.',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/quickstart',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

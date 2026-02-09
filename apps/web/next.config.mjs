/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@zeo/contracts',
    '@zeo/core',
    '@zeo/reality',
    '@zeo/radar',
    '@zeo/telemetry',
    '@zeo/governance',
    '@zeo/signal-discovery',
    '@zeo/kpi',
    '@zeo/warehouse'
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;

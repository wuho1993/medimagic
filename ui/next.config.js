/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  // trailingSlash: true,
  images: { unoptimized: true },
  // basePath: '/medimagic',
  // assetPrefix: '/medimagic/',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // Stub Node-only modules so server-side code that was converted
    // to client-side doesn't cause build errors.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      os: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      pg: false,
      'pg-native': false,
    };
    return config;
  },
};

module.exports = nextConfig;

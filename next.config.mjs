/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  experimental: {
    browsersListForSwc: true,
    legacyBrowsers: false,
  },
  async rewrites() {
    return [
      // Expose OpenAPI spec at /openapi.json for AI agents and tooling
      { source: '/openapi.json', destination: '/api/openapi' },
    ];
  },
};

export default nextConfig;

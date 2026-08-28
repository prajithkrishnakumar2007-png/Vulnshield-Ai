/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const destination = apiBase.endsWith('/') ? `${apiBase}:path*` : `${apiBase}/:path*`;
    return [
      {
        source: '/api/v1/:path*',
        destination: destination
      }
    ];
  }
};

module.exports = nextConfig;

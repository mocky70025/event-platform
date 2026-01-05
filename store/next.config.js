/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 開発中のキャッシュ問題を防ぐ
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig



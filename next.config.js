/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'cdn.myanimelist.net',
      'v1.samehadaku.how',
      'via.placeholder.com',
      'blogger.googleusercontent.com'
    ],
    unoptimized: true
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default-key',
  },
  async redirects() {
    return [
      // Redirect lama ke rute SEO baru
      {
        source: '/anime-detail',
        has: [
          {
            type: 'query',
            key: 'url',
            // Ambil slug dari URL: https://v1.samehadaku.how/anime/<slug>/
            value: 'https?:\\/\\/v1\\.samehadaku\\.how\\/anime\\/(?<slug>[^/]+)\\/?',
          },
        ],
        destination: '/anime/:slug',
        permanent: true,
      },
      {
        source: '/episode-player',
        has: [
          {
            type: 'query',
            key: 'url',
            // Ambil id dari URL: https://v1.samehadaku.how/<id>/
            value: 'https?:\\/\\/v1\\.samehadaku\\.how\\/(?<id>[^/]+)\\/?',
          },
        ],
        destination: '/episode/:id',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig

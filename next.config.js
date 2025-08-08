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
}

module.exports = nextConfig

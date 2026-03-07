/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/games/hopper',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

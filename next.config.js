/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/local-todos',
  assetPrefix: '/local-todos/',
};

module.exports = nextConfig; 
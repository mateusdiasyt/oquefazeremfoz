/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { 
    serverActions: { bodySizeLimit: '2mb' } 
  },
  // Configurações de imagem
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig


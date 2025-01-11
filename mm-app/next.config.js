/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb' // Increase the limit to 10MB
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
        port: '',
      },
      {
        protocol: 'http',
        hostname: '192.168.86.29',
        port: '54321',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
      },
      {
        protocol: 'http',
        hostname: '172.31.48.1',
        port: '54321',
      },
      {
        protocol: 'https',
        hostname: 'yjdrcbrkbqlslsdzquwv.supabase.co',
        port: '',
      }
    ]
  },
}

module.exports = nextConfig 
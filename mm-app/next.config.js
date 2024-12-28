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
      }
    ],
    domains: [
      '192.168.86.29', // Local Supabase storage
      'localhost',     // For local development
      'yjdrcbrkbqlslsdzquwv.supabase.co' // Production Supabase storage
    ],
  },
}

module.exports = nextConfig 
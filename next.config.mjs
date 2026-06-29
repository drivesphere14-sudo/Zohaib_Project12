/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Optimization settings for production
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Turbopack configuration (Next.js 16+)
  turbopack: {
    root: "/Users/zohaib/Desktop/Zohaib_Project12",
  },
}

export default nextConfig

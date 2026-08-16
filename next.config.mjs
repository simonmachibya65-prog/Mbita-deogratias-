/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore ESLint errors during build (warnings only)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Tell webpack to properly resolve modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "openai"];
    }
    
    // Ensure proper module resolution
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    
    return config;
  },

  // Allow images from any domain (for Unsplash demo images etc.)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  // Suppress specific warnings
  logging: {
    fetches: { fullUrl: false },
  },
  // v2
};

export default nextConfig;

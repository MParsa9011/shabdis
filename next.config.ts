import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    localPatterns: [
      { pathname: "/**" },
    ],
  },
  // Allow uploading to public/uploads in production
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;

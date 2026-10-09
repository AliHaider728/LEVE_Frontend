import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**.lovable.app" },
      { protocol: "https", hostname: "**.r2.dev" },
      // Add your future CDN domain here, e.g. { protocol: "https", hostname: "cdn.leva.pk" }
    ],
  },
};

export default nextConfig;

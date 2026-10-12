import path from "node:path";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  output: "standalone",
  // Keep development assets separate so production builds cannot break a running preview.
  distDir: process.env.NEXT_DIST_DIR || (phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next"),
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
});

export default nextConfig;

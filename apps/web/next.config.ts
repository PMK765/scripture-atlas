import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@bible-visualizer/bible-data",
    "@bible-visualizer/config",
  ],
  typedRoutes: true,
};

export default nextConfig;

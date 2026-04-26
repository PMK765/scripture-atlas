import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@bible-visualizer/bible-data",
    "@bible-visualizer/config",
    "@bible-visualizer/db",
  ],
  typedRoutes: true,
};

export default nextConfig;

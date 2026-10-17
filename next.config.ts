import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kept simple for a one-day build: no cache components / partial prefetching.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

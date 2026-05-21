import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  turbopack: {
    resolveAlias: {
      // pdf.js optionally requires canvas — ignore it in the browser bundle
      canvas: { browser: "./empty-module.js" },
    },
  },
};

export default nextConfig;

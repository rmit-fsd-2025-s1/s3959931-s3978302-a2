import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Exclude test files from being treated as pages
  pageExtensions: ["tsx", "ts", "jsx", "js"].filter(
    (ext) => !ext.includes("spec") && !ext.includes("test")
  ),

  webpack: (config) => {
    // Ignore test files in webpack
    config.module.rules.push({
      test: /\.(spec|test)\.(tsx|ts|jsx|js)$/,
      use: "null-loader",
    });

    return config;
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable React Strict Mode to prevent WebSocket double-mounting in development
  // This eliminates console errors from WebSocket connections being created/destroyed twice
  reactStrictMode: false,

  // Moved from experimental.serverComponentsExternalPackages to serverExternalPackages
  serverExternalPackages: ["typeorm"],
};

module.exports = nextConfig;

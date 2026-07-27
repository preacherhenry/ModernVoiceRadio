import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Default Server Action body limit is 1MB; admin image uploads (covers,
  // presenter photos, etc.) allow up to 5MB (see src/lib/upload.ts), so
  // raise the ceiling with headroom for multipart overhead.
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;

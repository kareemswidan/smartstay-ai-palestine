import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve the original project images directly so the public Cloudflare Worker
  // remains inside the free plan and does not require an Images binding.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

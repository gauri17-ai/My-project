import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix: multiple lockfiles warning on Vercel/Turbopack
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

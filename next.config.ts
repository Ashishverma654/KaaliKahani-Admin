import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Setting this to silence the workspace root warning
    turbo: {
      root: '.',
    },
  },
};

export default nextConfig;

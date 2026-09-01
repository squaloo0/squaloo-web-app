import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Founder page moved; keep old links working.
      { source: "/marshal", destination: "/founder", permanent: true },
    ];
  },
};

export default nextConfig;
